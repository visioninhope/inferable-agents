namespace Inferable
{
  class Machine
  {
    public static string GenerateMachineId()
    {
      return $"cs-{GetRandomString(8)}";
    }

    private static string GetRandomString(int length)
    {
      const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      var random = new Random();

      return new string(Enumerable.Repeat(chars, length)
          .Select(s => s[random.Next(s.Length)])
          .ToArray());
    }
  }
}
