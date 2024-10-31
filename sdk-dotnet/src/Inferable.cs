using System.Text.Json.Serialization;
using Inferable.API;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;

namespace Inferable
{
  public class Links
  {
    public static string DOCS_AUTH = "https://docs.inferable.ai/pages/auth";
  }

  /// <summary>
  /// Object type that will be returned to a Run's OnStatusChange Function.
  /// Generic type T is the type of the result the run's (resultSchema)
  /// </summary>
  public struct OnStatusChangeInput<T>
  {
    [JsonPropertyName("runId")]
    public string RunId { get; set; }

    [JsonPropertyName("status")]
    public string Status { get; set; }

    [JsonPropertyName("summary")]
    public string? Summary { get; set; }

    [JsonPropertyName("result")]
    public T? Result { get; set; }

    [JsonPropertyName("metadata")]
    public Dictionary<string, string> Metadata { get; set; }
  }

  public class InferableOptions
  {
    public string? BaseUrl { get; set; }
    public string? ApiSecret { get; set; }
    public string? MachineId { get; set; }
    public string? ClusterId { get; set; }
  }

  public struct PollRunOptions
  {
    public required TimeSpan MaxWaitTime { get; set; }
    public required TimeSpan Interval { get; set; }
  }

  public class RunReference
  {
    public required string ID { get; set; }
    public required Func<PollRunOptions?, Task<GetRunResult?>> Poll { get; set; }
  }

  public class InferableClient
  {
    public static string DefaultBaseUrl = "https://api.inferable.ai/";

    private readonly ApiClient _client;
    private readonly ILogger<InferableClient> _logger;
    private readonly string? _clusterId;

    // Dictionary of service name to list of functions
    private Dictionary<string, List<IFunctionRegistration>> _functionRegistry = new Dictionary<string, List<IFunctionRegistration>>();

    private List<Service> _services = new List<Service>();

    public RegisteredService Default
    {
      get
      {
        return this.RegisterService("default");
      }
    }

    public InferableClient(InferableOptions? options = null, ILogger<InferableClient>? logger = null)
    {
      string? apiSecret = options?.ApiSecret ?? Environment.GetEnvironmentVariable("INFERABLE_API_SECRET");
      string baseUrl = options?.BaseUrl ?? Environment.GetEnvironmentVariable("INFERABLE_API_ENDPOINT") ?? DefaultBaseUrl;
      string machineId = options?.MachineId ?? Machine.GenerateMachineId();
      this._clusterId = options?.ClusterId ?? Environment.GetEnvironmentVariable("INFERABLE_CLUSTER_ID");

      if (apiSecret == null)
      {
        throw new ArgumentNullException($"No API Secret provided. Please see ${Links.DOCS_AUTH}");
      }

      if (!apiSecret.StartsWith("sk_"))
      {
        throw new ArgumentException($"Invalid API Secret. Please see: {Links.DOCS_AUTH}");
      }


      this._client = new ApiClient(new ApiClientOptions{
          ApiSecret = apiSecret,
          BaseUrl = baseUrl,
          MachineId = machineId
      });

      this._logger = logger ?? NullLogger<InferableClient>.Instance;
    }

    public RegisteredService RegisterService(string name)
    {
      return new RegisteredService(name, this);
    }

    async public Task<RunReference> CreateRun(CreateRunInput input)
    {
      if (this._clusterId == null) {
        throw new ArgumentException("Cluster ID must be provided to manage runs");
      }

      var result = await this._client.CreateRun(this._clusterId, input);

      return new RunReference {
        ID = result.ID,
        Poll = async (PollRunOptions? options) => {
          var MaxWaitTime = options?.MaxWaitTime ?? TimeSpan.FromSeconds(60);
          var Interval = options?.Interval ?? TimeSpan.FromMilliseconds(500);

          var start = DateTime.Now;
          var end = start + MaxWaitTime;
          while (DateTime.Now < end) {
            var pollResult = await this._client.GetRun(this._clusterId, result.ID);

            var transientStates = new List<string> { "pending", "running" };
            if (transientStates.Contains(pollResult.Status)) {
              await Task.Delay(Interval);
              continue;
            }

            return pollResult;
          }
          return null;
        }
      };
    }

    public IEnumerable<string> ActiveServices
    {
      get
      {
        return this._services.Where(s => s.Polling).Select(s => s.Name);
      }
    }

    public IEnumerable<string> InactiveServices
    {
      get
      {
        return this._services.Where(s => !s.Polling).Select(s => s.Name);
      }
    }

    public IEnumerable<string> RegisteredFunctions
    {
      get
      {
        return this._functionRegistry.SelectMany(f => f.Value.Select(v => v.Name));

      }
    }

    internal void RegisterFunction<T>(string serviceName, FunctionRegistration<T> function) where T : struct {
      var existing = this.RegisteredFunctions.FirstOrDefault(f => f == function.Name);
      if (existing != null) {
        throw new Exception($"Function with name '{function.Name}' already registered");
      }

      if (!this._functionRegistry.ContainsKey(serviceName)) {
        this._functionRegistry.Add(serviceName, new List<IFunctionRegistration> { function });
      } else {
        this._functionRegistry[serviceName].Add(function);
      }

    }

    internal async Task StartService(string name) {
      var existing = this._services.FirstOrDefault(s => s.Name == name);
      if (existing != null) {
        throw new Exception("Service is already started");
      }

      if (!this._functionRegistry.ContainsKey(name)) {
        throw new Exception($"No functions registered for service '{name}'");
      }

      var functions = this._functionRegistry[name];

      var service = new Service(name, this._client, this._logger, functions);

      this._services.Add(service);
      await service.Start();
    }

    internal async Task StopService(string name) {
      var existing = this._services.FirstOrDefault(s => s.Name == name);
      if (existing == null) {
        throw new Exception("Service is not started");
      }
      await existing.Stop();
    }
  }

  public struct RegisteredService
  {
    private string _name;
    private InferableClient _inferable;

    internal RegisteredService(string name, InferableClient inferable) {
      this._name = name;
      this._inferable = inferable;
    }

    public FunctionReference RegisterFunction<T>(FunctionRegistration<T> function) where T : struct {
      this._inferable.RegisterFunction<T>(this._name, function);

      return new FunctionReference {
        Service = this._name,
        Function = function.Name
      };
    }

    async public Task Start() {
      await this._inferable.StartService(this._name);
    }

    async public Task Stop() {
      await this._inferable.StopService(this._name);
    }
  }


}
