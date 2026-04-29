using Jaza.Migration;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Serilog;

var host = Host.CreateApplicationBuilder(args);
host.Services.AddSerilog((sp, cfg) => cfg.ReadFrom.Configuration(host.Configuration).WriteTo.Console());
host.Services.AddSingleton<EtlOptions>(sp =>
{
    var opts = new EtlOptions();
    host.Configuration.Bind("Etl", opts);
    OverrideFromArgs(opts, args);
    return opts;
});
host.Services.AddSingleton<EtlRunner>();
var app = host.Build();

var runner = app.Services.GetRequiredService<EtlRunner>();
await runner.RunAsync();

static void OverrideFromArgs(EtlOptions opts, string[] args)
{
    foreach (var a in args)
    {
        if (a == "--dry-run") opts.DryRun = true;
        else if (a.StartsWith("--only=", StringComparison.OrdinalIgnoreCase))
            opts.Only = a["--only=".Length..].Split(',', StringSplitOptions.RemoveEmptyEntries).Select(s => s.Trim()).ToArray();
        else if (a.StartsWith("--since=", StringComparison.OrdinalIgnoreCase) && DateTime.TryParse(a["--since=".Length..], out var since))
            opts.Since = since;
        else if (a.StartsWith("--legacy-cs=", StringComparison.OrdinalIgnoreCase))
            opts.LegacyConnectionString = a["--legacy-cs=".Length..];
        else if (a.StartsWith("--target-cs=", StringComparison.OrdinalIgnoreCase))
            opts.TargetConnectionString = a["--target-cs=".Length..];
    }
}
