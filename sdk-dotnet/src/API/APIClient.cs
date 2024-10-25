using System.Net.Http.Headers;
using System.Reflection;
using System.Text;
using System.Text.Json;

namespace Inferable.API
{
  public class ApiClientOptions
  {
    public required string BaseUrl { get; set; }
    public required string ApiSecret { get; set; }
    public required string MachineId { get; set; }
  }

  public class ApiClient
  {

    private readonly HttpClient _client;

    public ApiClient(ApiClientOptions options)
    {
      this._client = new HttpClient();

      var version = Assembly.GetAssembly(typeof(InferableClient))?
        .GetName()?
        .Version?
        .ToString() ?? throw new Exception("Failed to get Inferable SDK version");

      _client.BaseAddress = new Uri(options.BaseUrl);

      _client.DefaultRequestHeaders.Add("x-machine-id", options.MachineId);
      _client.DefaultRequestHeaders.Add("x-machine-sdk-version", version);
      _client.DefaultRequestHeaders.Add("x-machine-sdk-language", "cs");

      _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("bearer", options.ApiSecret);
    }


    async public Task<CreateMachineResult> CreateMachine(CreateMachineInput input)
    {
      string jsonData = JsonSerializer.Serialize(input);

      HttpResponseMessage response = await _client.PostAsync(
          "/machines",
          new StringContent(jsonData, Encoding.UTF8, "application/json")
          );

      response.EnsureSuccessStatusCode();

      string responseBody = await response.Content.ReadAsStringAsync();
      return JsonSerializer.Deserialize<CreateMachineResult>(responseBody);
    }

    async public Task CreateCallResult(string clusterId, string callId, CreateResultInput input)
    {
      string jsonData = JsonSerializer.Serialize(input);

      HttpResponseMessage response = await _client.PostAsync(
          $"/clusters/{clusterId}/calls/{callId}/result",
          new StringContent(jsonData, Encoding.UTF8, "application/json")
          );

      response.EnsureSuccessStatusCode();
    }

    async public Task<(List<CallMessage>, int?)> ListCalls(string clusterId, string service)
    {
      HttpResponseMessage response = await _client.GetAsync(
          $"/clusters/{clusterId}/calls?service={service}&acknowledge=true"
          );

      response.EnsureSuccessStatusCode();

      string responseBody = await response.Content.ReadAsStringAsync();
      var result = JsonSerializer.Deserialize<List<CallMessage>>(responseBody) ?? new List<CallMessage>();

      var retryAfterHeader = response.Headers.RetryAfter?.ToString() ?? "";

      try
      {
        int.Parse(retryAfterHeader);
      }
      catch
      {
        return (result, null);
      }

      return (result, int.Parse(retryAfterHeader));
    }

    async public Task<CreateCallResult> CreateCall(string clusterId, CreateCallInput input)
    {
      string jsonData = JsonSerializer.Serialize(input);

      HttpResponseMessage response = await _client.PostAsync(
          $"/clusters/{clusterId}/calls?waitTime=20",
          new StringContent(jsonData, Encoding.UTF8, "application/json")
          );

      response.EnsureSuccessStatusCode();

      string responseBody = await response.Content.ReadAsStringAsync();
      return JsonSerializer.Deserialize<CreateCallResult>(responseBody);
    }
  }
}
