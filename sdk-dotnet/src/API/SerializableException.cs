namespace Inferable.API
{
  public class SerializableException
  {
    public string? Message { get; set; }
    public string? StackTrace { get; set; }
    public string? Source { get; set; }
    public string Type { get; set; }
    public SerializableException? InnerException { get; set; }

    public SerializableException(Exception ex)
    {
      Message = ex.Message;
      StackTrace = ex.StackTrace;
      Source = ex.Source;
      Type = ex.GetType().FullName ?? "Exception";
      if (ex.InnerException != null)
      {
        InnerException = new SerializableException(ex.InnerException);
      }
    }
  }
}
