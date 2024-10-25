using Inferable.API;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;

namespace Inferable
{
  public class InferableOptions
  {
    public string? BaseUrl { get; set; }
    public string? ApiSecret { get; set; }
    /// <summary>
    /// PingInterval in seconds
    /// </summary>
    public int? PingInterval { get; set; }
    public string? MachineId { get; set; }
  }


  public class InferableClient
  {
    public static string DefaultBaseUrl = "https://api.inferable.ai/";

    private readonly ApiClient _client;
    private readonly ILogger<InferableClient> _logger;

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

      if (apiSecret == null)
      {
        throw new ArgumentNullException(nameof(options.ApiSecret), "APIKey cannot be null.");
      }

      if (!apiSecret.StartsWith("sk_cluster_machine"))
      {
        if (apiSecret.StartsWith("sk_"))
        {
          throw new ArgumentException($"Provided non-Machine API Secret. Please see");
        }

        throw new ArgumentException($"Invalid API Secret. Please see");
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
        throw new Exception($"No functions registered with for service '{name}'");
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

    public void RegisterFunction<T>(FunctionRegistration<T> function) where T : struct {
      this._inferable.RegisterFunction<T>(this._name, function);
    }

    async public Task Start() {
      await this._inferable.StartService(this._name);
    }

    async public Task Stop() {
      await this._inferable.StopService(this._name);
    }
  }


}
