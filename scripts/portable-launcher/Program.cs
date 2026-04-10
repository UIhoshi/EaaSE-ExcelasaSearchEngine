using System.Diagnostics;
using System.Net.Http;
using System.Text;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;

namespace EaaSE;

internal static class Program
{
    private const string AppTitle = "EaaSE";
    private const int Port = 4173;

    [STAThread]
    private static void Main()
    {
        ApplicationConfiguration.Initialize();

        var appDir = AppContext.BaseDirectory;
        var distIndexPath = Path.Combine(appDir, "dist", "index.html");
        var bundledServerScriptPath = Path.Combine(appDir, "scripts", "serve-dist.cjs");
        var legacyServerScriptPath = Path.Combine(appDir, "scripts", "serve-dist.mjs");
        var serverScriptPath = File.Exists(bundledServerScriptPath) ? bundledServerScriptPath : legacyServerScriptPath;
        var configDir = Path.Combine(appDir, "config");
        var startupLogPath = Path.Combine(configDir, "startup.log");

        Directory.CreateDirectory(configDir);
        File.WriteAllText(startupLogPath, $"[{DateTime.Now:yyyy-MM-dd HH:mm:ss}] launcher start{Environment.NewLine}", Encoding.UTF8);

        if (!File.Exists(distIndexPath) || !File.Exists(serverScriptPath))
        {
            AppendLog(startupLogPath, "dist/index.html or bundled server script is missing.");
            MessageBox.Show(
                $"运行文件不完整，请确认 dist 目录和 scripts 下的 serve-dist.cjs 或 serve-dist.mjs 存在。\n\n日志：{startupLogPath}",
                AppTitle,
                MessageBoxButtons.OK,
                MessageBoxIcon.Error);
            return;
        }

        if (!EnsureNodeAvailable(appDir, startupLogPath))
        {
            return;
        }

        try
        {
            Process? serverProcess = null;

            if (!IsServerReady())
            {
                serverProcess = StartServer(appDir, serverScriptPath, startupLogPath);
                WaitForServerAsync(startupLogPath).GetAwaiter().GetResult();
            }
            else
            {
                AppendLog(startupLogPath, "reusing existing local server on port 4173");
            }

            Application.Run(new MainForm(serverProcess, startupLogPath));
        }
        catch (Exception ex)
        {
            AppendLog(startupLogPath, $"launcher exception: {ex}");
            MessageBox.Show(
                $"启动失败，请查看日志：{startupLogPath}",
                AppTitle,
                MessageBoxButtons.OK,
                MessageBoxIcon.Error);
        }
    }

    private static bool EnsureNodeAvailable(string appDir, string startupLogPath)
    {
        if (CanFindNode())
        {
            return true;
        }

        AppendLog(startupLogPath, "Node.js was not found in PATH.");

        var prereqDir = Path.Combine(appDir, "prereqs", "windows");
        var installerPath = Directory.Exists(prereqDir)
            ? Directory.GetFiles(prereqDir, "node-v*-x64.msi").FirstOrDefault()
            : null;

        if (string.IsNullOrWhiteSpace(installerPath))
        {
            MessageBox.Show(
                $"未检测到 Node.js，且当前目录没有附带安装包。\n\n请先安装 Node.js 后重新启动。\n\n日志：{startupLogPath}",
                AppTitle,
                MessageBoxButtons.OK,
                MessageBoxIcon.Warning);
            return false;
        }

        var result = MessageBox.Show(
            $"未检测到 Node.js。\n\n是否现在安装当前目录附带的官方 Node.js MSI？\n\n{installerPath}\n\n日志：{startupLogPath}",
            AppTitle,
            MessageBoxButtons.YesNo,
            MessageBoxIcon.Question);

        if (result != DialogResult.Yes)
        {
            AppendLog(startupLogPath, "User declined Node.js installation.");
            return false;
        }

        Process.Start(new ProcessStartInfo
        {
            FileName = "msiexec.exe",
            Arguments = $"/i \"{installerPath}\"",
            UseShellExecute = true,
        })?.WaitForExit();

        if (!CanFindNode())
        {
            AppendLog(startupLogPath, "Node.js still missing after installer finished.");
            MessageBox.Show(
                $"安装结束后仍未检测到 Node.js。\n\n请重新打开 EaaSE，或确认 PATH 已刷新。\n\n日志：{startupLogPath}",
                AppTitle,
                MessageBoxButtons.OK,
                MessageBoxIcon.Warning);
            return false;
        }

        AppendLog(startupLogPath, "Node.js installation completed.");
        return true;
    }

    private static bool CanFindNode()
    {
        try
        {
            using var process = Process.Start(new ProcessStartInfo
            {
                FileName = "where.exe",
                Arguments = "node",
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true,
            });

            process?.WaitForExit();
            return process is not null && process.ExitCode == 0;
        }
        catch
        {
            return false;
        }
    }

    private static Process StartServer(string workingDirectory, string serverScriptPath, string startupLogPath)
    {
        var startInfo = new ProcessStartInfo
        {
            FileName = "node",
            Arguments = $"\"{serverScriptPath}\"",
            WorkingDirectory = workingDirectory,
            UseShellExecute = false,
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            CreateNoWindow = true,
            WindowStyle = ProcessWindowStyle.Hidden,
        };

        var process = Process.Start(startInfo);
        if (process is null)
        {
            throw new InvalidOperationException("无法启动本地服务。");
        }

        process.OutputDataReceived += (_, args) =>
        {
            if (!string.IsNullOrWhiteSpace(args.Data))
            {
                AppendLog(startupLogPath, $"server stdout: {args.Data}");
            }
        };
        process.ErrorDataReceived += (_, args) =>
        {
            if (!string.IsNullOrWhiteSpace(args.Data))
            {
                AppendLog(startupLogPath, $"server stderr: {args.Data}");
            }
        };
        process.BeginOutputReadLine();
        process.BeginErrorReadLine();

        AppendLog(startupLogPath, $"server process started: pid={process.Id}");
        return process;
    }

    private static async Task WaitForServerAsync(string startupLogPath)
    {
        using var httpClient = new HttpClient
        {
            Timeout = TimeSpan.FromSeconds(2),
        };

        for (var attempt = 1; attempt <= 15; attempt++)
        {
            try
            {
                using var response = await httpClient.GetAsync($"http://127.0.0.1:{Port}/");
                if (response.IsSuccessStatusCode)
                {
                    AppendLog(startupLogPath, $"server ready after attempt {attempt}");
                    return;
                }
            }
            catch (Exception ex)
            {
                AppendLog(startupLogPath, $"server probe {attempt} failed: {ex.Message}");
            }

            await Task.Delay(500);
        }

        throw new InvalidOperationException("Local server did not become ready in time.");
    }

    private static bool IsServerReady()
    {
        try
        {
            using var httpClient = new HttpClient
            {
                Timeout = TimeSpan.FromSeconds(1),
            };
            using var response = httpClient.GetAsync($"http://127.0.0.1:{Port}/").GetAwaiter().GetResult();
            return response.IsSuccessStatusCode;
        }
        catch
        {
            return false;
        }
    }

    internal static void AppendLog(string logPath, string message)
    {
        File.AppendAllText(logPath, $"[{DateTime.Now:yyyy-MM-dd HH:mm:ss}] {message}{Environment.NewLine}", Encoding.UTF8);
    }
}

internal sealed class MainForm : Form
{
    private readonly Process? _serverProcess;
    private readonly string _startupLogPath;
    private readonly WebView2 _webView;
    private readonly Label _statusLabel;

    public MainForm(Process? serverProcess, string startupLogPath)
    {
        _serverProcess = serverProcess;
        _startupLogPath = startupLogPath;
        Text = "EaaSE";
        Width = 1440;
        Height = 920;
        StartPosition = FormStartPosition.CenterScreen;

        _statusLabel = new Label
        {
            Dock = DockStyle.Top,
            Height = 32,
            TextAlign = ContentAlignment.MiddleLeft,
            Padding = new Padding(12, 0, 0, 0),
            Text = "正在启动本地界面...",
        };

        _webView = new WebView2
        {
            Dock = DockStyle.Fill,
        };

        Controls.Add(_webView);
        Controls.Add(_statusLabel);

        Load += HandleLoad;
        FormClosed += HandleFormClosed;
    }

    private async void HandleLoad(object? sender, EventArgs e)
    {
        try
        {
            await _webView.EnsureCoreWebView2Async();
            _webView.CoreWebView2.Settings.AreDefaultContextMenusEnabled = true;
            _webView.CoreWebView2.Settings.IsStatusBarEnabled = false;
            _webView.CoreWebView2.NavigationCompleted += HandleNavigationCompleted;
            _webView.Source = new Uri("http://127.0.0.1:4173/?launcher=1");
        }
        catch (WebView2RuntimeNotFoundException)
        {
            Program.AppendLog(_startupLogPath, "WebView2 Runtime not found.");
            var installerDirectory = Path.Combine(AppContext.BaseDirectory, "prereqs", "windows");
            var installerPath = Path.Combine(installerDirectory, "MicrosoftEdgeWebView2Setup.exe");

            if (File.Exists(installerPath))
            {
                var result = MessageBox.Show(
                    $"未检测到 WebView2 Runtime。\n\n是否现在安装当前目录附带的 WebView2 Runtime 引导程序？\n\n{installerPath}\n\n日志：{_startupLogPath}",
                    "EaaSE",
                    MessageBoxButtons.YesNo,
                    MessageBoxIcon.Question);

                if (result == DialogResult.Yes)
                {
                    try
                    {
                        var installer = Process.Start(new ProcessStartInfo
                        {
                            FileName = installerPath,
                            UseShellExecute = true,
                        });

                        installer?.WaitForExit();
                    }
                    catch (Exception ex)
                    {
                        Program.AppendLog(_startupLogPath, $"WebView2 installer exception: {ex}");
                    }
                }
            }
            else
            {
                MessageBox.Show(
                    $"未检测到 WebView2 Runtime，且当前目录没有附带安装程序。\n\n日志：{_startupLogPath}",
                    "EaaSE",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Warning);
            }

            Close();
        }
        catch (Exception ex)
        {
            Program.AppendLog(_startupLogPath, $"WebView2 exception: {ex}");
            MessageBox.Show(
                $"桌面壳启动失败：{ex.Message}\n\n日志：{_startupLogPath}",
                "EaaSE",
                MessageBoxButtons.OK,
                MessageBoxIcon.Error);
            Close();
        }
    }

    private void HandleNavigationCompleted(object? sender, CoreWebView2NavigationCompletedEventArgs e)
    {
        _statusLabel.Text = e.IsSuccess ? "EaaSE 已就绪" : "页面加载失败，请检查本地服务是否正常";
    }

    private void HandleFormClosed(object? sender, FormClosedEventArgs e)
    {
        try
        {
            if (_serverProcess is not null && !_serverProcess.HasExited)
            {
                _serverProcess.Kill(true);
                _serverProcess.WaitForExit(2000);
            }
        }
        catch
        {
        }
    }
}
