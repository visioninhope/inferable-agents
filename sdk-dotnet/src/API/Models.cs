using System.Text.Json.Serialization;

namespace Inferable.API
{
  public struct CreateMachineInput
  {
    [JsonPropertyName("service")]
    public required string Service { get; set; }
    [JsonPropertyName("functions")]
    public required List<Function> Functions { get; set; }
  }

  public struct CreateMachineResult
  {
    [JsonPropertyName("clusterId")]
    public required string ClusterId { get; set; }
  }

  public struct CallMessage
  {
    [JsonPropertyName("id")]
    public required string Id { get; set; }
    [JsonPropertyName("function")]
    public required string Function { get; set; }
    [JsonPropertyName("input")]
    public object Input { get; set; }
  }

  public struct CreateResultMeta {
    [
      JsonPropertyName("functionExecutionTime"),
      JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)
    ]
    public int? FunctionExecutionTime { get; set; }
  }

  public struct CreateResultInput
  {
    [JsonPropertyName("result")]
    public object? Result { get; set; }
    [JsonPropertyName("resultType")]
    public required string ResultType { get; set; }
    [JsonPropertyName("meta")]
    public CreateResultMeta Meta { get; set; }
  }

  public struct CreateCallInput
  {
    [JsonPropertyName("service")]
    public required string Service { get; set; }

    [JsonPropertyName("function")]
    public required string Function { get; set; }

    [JsonPropertyName("input")]
    public required object Input { get; set; }
  }

  public struct CreateCallResult
  {
    // TODO Make enum
    [JsonPropertyName("resultType")]
    public required string? ResultType { get; set; }

    [JsonPropertyName("result")]
    public object? Result { get; set; }

    // TODO: Make enum
    [JsonPropertyName("status")]
    public required string Status { get; set; }
  }

  public struct Function
  {
    [JsonPropertyName("name")]
    public string? Name { get; set; }

    [
      JsonPropertyName("description"),
      JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)
    ]
    public string? Description { get; set; }

    [JsonPropertyName("schema")]
    public required string Schema { get; set; }

    [
      JsonPropertyName("config"),
      JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)
    ]
    public FunctionConfig? Config { get; set; }
  }

  public struct FunctionConfig
  {
    [
      JsonPropertyName("requiresApproval"),
      JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)
    ]
    public bool? RequiresApproval { get; set; }

    [
      JsonPropertyName("retryCountOnStall"),
      JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)
    ]
    public int? RetryCountOnStall { get; set; }

    [
      JsonPropertyName("timeoutSeconds"),
      JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)
    ]
    public int? TimeoutSeconds { get; set; }
  }

}
