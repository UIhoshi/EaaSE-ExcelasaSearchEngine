using System.Diagnostics;
using System.Globalization;
using System.IO.Compression;
using System.Reflection;

namespace EaaSEInstaller;

internal static class Program
{
    [STAThread]
    private static void Main()
    {
        ApplicationConfiguration.Initialize();
        Application.Run(new InstallerForm());
    }
}

internal enum InstallerLanguage
{
    ZhCn,
    EnUs,
    JaJp,
}

internal sealed class InstallerText
{
    public required string WindowTitle { get; init; }
    public required string Heading { get; init; }
    public required string Subheading { get; init; }
    public required string LanguageLabel { get; init; }
    public required string PrivacyHeading { get; init; }
    public required string PrivacyBody { get; init; }
    public required string InstallLocationLabel { get; init; }
    public required string BrowseButton { get; init; }
    public required string AcknowledgeText { get; init; }
    public required string InstallButton { get; init; }
    public required string CancelButton { get; init; }
    public required string InstallingText { get; init; }
    public required string InstallCompleteTitle { get; init; }
    public required string InstallCompleteBody { get; init; }
    public required string OpenAppNow { get; init; }
    public required string CloseText { get; init; }
    public required string InstallFailedTitle { get; init; }
    public required string InstallFailedBody { get; init; }
    public required string BrowseTitle { get; init; }
    public required string ExistingInstallPrompt { get; init; }
    public required string ExistingInstallTitle { get; init; }
    public required string WritingFilesStatus { get; init; }
    public required string CreatingShortcutStatus { get; init; }
    public required string FinalizingStatus { get; init; }
}

internal static class InstallerTexts
{
    public static InstallerLanguage DetectDefaultLanguage()
    {
        var culture = CultureInfo.CurrentUICulture.Name.ToLowerInvariant();
        if (culture.StartsWith("ja"))
        {
            return InstallerLanguage.JaJp;
        }

        if (culture.StartsWith("zh"))
        {
            return InstallerLanguage.ZhCn;
        }

        return InstallerLanguage.EnUs;
    }

    public static InstallerText Get(InstallerLanguage language) =>
        language switch
        {
            InstallerLanguage.ZhCn => new InstallerText
            {
                WindowTitle = "EaaSE 安装程序",
                Heading = "安装 EaaSE",
                Subheading = "本安装程序将把 EaaSE 部署到你的本机，并保留本地检索、定位和日志能力。",
                LanguageLabel = "语言",
                PrivacyHeading = "本地隐私与日志声明",
                PrivacyBody =
                    "1. EaaSE 是纯本地运行的软件，核心检索、缓存和结果展示均在当前设备内完成。\r\n" +
                    "2. 安装器和软件本体不会主动联网上传 Excel、配置文件、搜索词、命中结果或任何用户业务数据。\r\n" +
                    "3. 软件仅在本机目录保存与故障排查相关的运行日志，用于定位启动失败、依赖缺失、运行异常等技术问题。\r\n" +
                    "4. 这些日志默认保存在软件目录下，可由用户自行查看、备份或删除；日志不作为远程采集通道。\r\n" +
                    "5. 若系统缺少 Node.js 或 WebView2，本安装包会一并安装或调用本地附带的官方运行时安装程序；该过程不改变本产品“纯本地处理用户数据”的原则。\r\n" +
                    "6. 安装即表示你理解：EaaSE 只处理你在本机选择的文件，不接触、不传输、不上传任何未被你显式打开的用户数据。",
                InstallLocationLabel = "安装位置",
                BrowseButton = "浏览...",
                AcknowledgeText = "我已阅读并理解上述本地隐私、日志和安装说明。",
                InstallButton = "开始安装",
                CancelButton = "取消",
                InstallingText = "正在准备安装...",
                InstallCompleteTitle = "安装完成",
                InstallCompleteBody = "EaaSE 已成功安装到以下位置：",
                OpenAppNow = "立即启动 EaaSE",
                CloseText = "关闭",
                InstallFailedTitle = "安装失败",
                InstallFailedBody = "安装过程中发生错误。详细信息：",
                BrowseTitle = "选择安装位置",
                ExistingInstallPrompt = "目标目录已存在内容。是否继续并覆盖同名文件？",
                ExistingInstallTitle = "检测到现有安装目录",
                WritingFilesStatus = "正在写入程序文件...",
                CreatingShortcutStatus = "正在创建快捷方式...",
                FinalizingStatus = "正在完成安装...",
            },
            InstallerLanguage.JaJp => new InstallerText
            {
                WindowTitle = "EaaSE インストーラー",
                Heading = "EaaSE をインストール",
                Subheading = "このインストーラーは、EaaSE をローカル環境に配置し、ローカル検索・位置特定・診断ログ機能を有効にします。",
                LanguageLabel = "言語",
                PrivacyHeading = "ローカルプライバシーとログに関する通知",
                PrivacyBody =
                    "1. EaaSE はローカル専用ソフトウェアであり、検索、キャッシュ、結果表示はすべてこの端末内で完結します。\r\n" +
                    "2. インストーラーおよびアプリ本体は、Excel、設定ファイル、検索語、ヒット結果、その他のユーザーデータを外部へ送信またはアップロードしません。\r\n" +
                    "3. ソフトウェアは不具合解析のための実行ログのみを端末上に保存し、起動失敗、依存関係不足、実行時例外などの技術的問題の調査に使用します。\r\n" +
                    "4. これらのログは既定でアプリケーションのローカルフォルダーに保存され、ユーザー自身で確認、バックアップ、削除できます。リモート収集には使用しません。\r\n" +
                    "5. Node.js または WebView2 が不足している場合、本インストーラーは同梱の公式ランタイムインストーラーを使用しますが、ユーザーデータをローカルでのみ扱うという原則は変わりません。\r\n" +
                    "6. インストールを続行することで、EaaSE はユーザーが明示的に開いたローカルファイルのみを処理し、それ以外のデータには触れず、送信もアップロードもしないことを理解したものとみなされます。",
                InstallLocationLabel = "インストール先",
                BrowseButton = "参照...",
                AcknowledgeText = "上記のローカルプライバシー、ログ、およびインストールに関する説明を読み、理解しました。",
                InstallButton = "インストール開始",
                CancelButton = "キャンセル",
                InstallingText = "インストールを準備しています...",
                InstallCompleteTitle = "インストール完了",
                InstallCompleteBody = "EaaSE は次の場所に正常にインストールされました：",
                OpenAppNow = "今すぐ EaaSE を起動",
                CloseText = "閉じる",
                InstallFailedTitle = "インストール失敗",
                InstallFailedBody = "インストール中にエラーが発生しました。詳細：",
                BrowseTitle = "インストール先を選択",
                ExistingInstallPrompt = "インストール先フォルダーには既存の内容があります。続行して同名ファイルを上書きしますか。",
                ExistingInstallTitle = "既存のインストール先を検出",
                WritingFilesStatus = "プログラムファイルを書き込んでいます...",
                CreatingShortcutStatus = "ショートカットを作成しています...",
                FinalizingStatus = "インストールを完了しています...",
            },
            _ => new InstallerText
            {
                WindowTitle = "EaaSE Installer",
                Heading = "Install EaaSE",
                Subheading = "This installer deploys EaaSE to your local machine and preserves local search, file-location, and diagnostic log capabilities.",
                LanguageLabel = "Language",
                PrivacyHeading = "Local Privacy and Diagnostic Notice",
                PrivacyBody =
                    "1. EaaSE is a local-only application. Search, cache, and result rendering are processed on this device.\r\n" +
                    "2. The installer and the application do not transmit or upload Excel files, configuration files, search terms, hit results, or any user business data.\r\n" +
                    "3. The software stores only local diagnostic logs related to software defects and runtime troubleshooting, such as startup failures, missing dependencies, or application exceptions.\r\n" +
                    "4. These logs stay in the local application directory and can be reviewed, backed up, or deleted by the user at any time; they are not used as a remote collection channel.\r\n" +
                    "5. If Node.js or WebView2 is missing, this installer may invoke the bundled official runtime installers locally, without changing the product's local-only data handling model.\r\n" +
                    "6. By continuing, you acknowledge that EaaSE processes only the files you explicitly choose on this machine and does not access, transmit, or upload unrelated user data.",
                InstallLocationLabel = "Install location",
                BrowseButton = "Browse...",
                AcknowledgeText = "I have read and understood the local privacy, logging, and installation notice above.",
                InstallButton = "Install",
                CancelButton = "Cancel",
                InstallingText = "Preparing installation...",
                InstallCompleteTitle = "Installation Complete",
                InstallCompleteBody = "EaaSE was installed successfully to:",
                OpenAppNow = "Launch EaaSE now",
                CloseText = "Close",
                InstallFailedTitle = "Installation Failed",
                InstallFailedBody = "An error occurred during installation. Details:",
                BrowseTitle = "Choose installation folder",
                ExistingInstallPrompt = "The destination folder already contains files. Continue and overwrite files with the same name?",
                ExistingInstallTitle = "Existing installation folder detected",
                WritingFilesStatus = "Writing application files...",
                CreatingShortcutStatus = "Creating shortcuts...",
                FinalizingStatus = "Finalizing installation...",
            },
        };
}

internal sealed class InstallerForm : Form
{
    private readonly ComboBox _languageSelector;
    private readonly Label _headingLabel;
    private readonly Label _subheadingLabel;
    private readonly Label _languageLabel;
    private readonly Label _privacyHeadingLabel;
    private readonly RichTextBox _privacyBodyBox;
    private readonly Label _installLocationLabel;
    private readonly TextBox _installPathBox;
    private readonly Button _browseButton;
    private readonly CheckBox _acknowledgeBox;
    private readonly ProgressBar _progressBar;
    private readonly Label _statusLabel;
    private readonly Button _installButton;
    private readonly Button _cancelButton;

    private InstallerLanguage _language;

    public InstallerForm()
    {
        _language = InstallerTexts.DetectDefaultLanguage();
        Text = "EaaSE Installer";
        Width = 860;
        Height = 760;
        MinimumSize = new Size(860, 760);
        StartPosition = FormStartPosition.CenterScreen;

        var panel = new TableLayoutPanel
        {
            Dock = DockStyle.Fill,
            Padding = new Padding(24),
            ColumnCount = 1,
            RowCount = 10,
        };
        panel.RowStyles.Add(new RowStyle(SizeType.AutoSize));
        panel.RowStyles.Add(new RowStyle(SizeType.AutoSize));
        panel.RowStyles.Add(new RowStyle(SizeType.AutoSize));
        panel.RowStyles.Add(new RowStyle(SizeType.AutoSize));
        panel.RowStyles.Add(new RowStyle(SizeType.Percent, 100));
        panel.RowStyles.Add(new RowStyle(SizeType.AutoSize));
        panel.RowStyles.Add(new RowStyle(SizeType.AutoSize));
        panel.RowStyles.Add(new RowStyle(SizeType.AutoSize));
        panel.RowStyles.Add(new RowStyle(SizeType.AutoSize));
        panel.RowStyles.Add(new RowStyle(SizeType.AutoSize));

        _headingLabel = new Label
        {
            AutoSize = true,
            Font = new Font("Segoe UI", 18, FontStyle.Bold),
            Margin = new Padding(0, 0, 0, 8),
        };

        _subheadingLabel = new Label
        {
            AutoSize = true,
            MaximumSize = new Size(780, 0),
            Font = new Font("Segoe UI", 10),
            Margin = new Padding(0, 0, 0, 16),
        };

        var languageRow = new FlowLayoutPanel
        {
            AutoSize = true,
            FlowDirection = FlowDirection.LeftToRight,
            Margin = new Padding(0, 0, 0, 16),
        };

        _languageLabel = new Label
        {
            AutoSize = true,
            Margin = new Padding(0, 8, 8, 0),
        };

        _languageSelector = new ComboBox
        {
            DropDownStyle = ComboBoxStyle.DropDownList,
            Width = 180,
        };
        _languageSelector.Items.AddRange(new object[]
        {
            "简体中文",
            "English",
            "日本語",
        });
        _languageSelector.SelectedIndexChanged += (_, _) =>
        {
            _language = _languageSelector.SelectedIndex switch
            {
                0 => InstallerLanguage.ZhCn,
                2 => InstallerLanguage.JaJp,
                _ => InstallerLanguage.EnUs,
            };
            ApplyText();
        };

        languageRow.Controls.Add(_languageLabel);
        languageRow.Controls.Add(_languageSelector);

        _privacyHeadingLabel = new Label
        {
            AutoSize = true,
            Font = new Font("Segoe UI", 11, FontStyle.Bold),
            Margin = new Padding(0, 0, 0, 8),
        };

        _privacyBodyBox = new RichTextBox
        {
            ReadOnly = true,
            DetectUrls = false,
            BorderStyle = BorderStyle.FixedSingle,
            BackColor = Color.White,
            Dock = DockStyle.Fill,
            Margin = new Padding(0, 0, 0, 16),
        };

        var installRow = new TableLayoutPanel
        {
            ColumnCount = 3,
            Dock = DockStyle.Fill,
            AutoSize = true,
            Margin = new Padding(0, 0, 0, 16),
        };
        installRow.ColumnStyles.Add(new ColumnStyle(SizeType.AutoSize));
        installRow.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 100));
        installRow.ColumnStyles.Add(new ColumnStyle(SizeType.AutoSize));

        _installLocationLabel = new Label
        {
            AutoSize = true,
            Margin = new Padding(0, 8, 12, 0),
        };

        _installPathBox = new TextBox
        {
            Dock = DockStyle.Fill,
            Text = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                "Programs",
                "EaaSE"),
        };

        _browseButton = new Button
        {
            AutoSize = true,
            Margin = new Padding(12, 0, 0, 0),
        };
        _browseButton.Click += HandleBrowse;

        installRow.Controls.Add(_installLocationLabel, 0, 0);
        installRow.Controls.Add(_installPathBox, 1, 0);
        installRow.Controls.Add(_browseButton, 2, 0);

        _acknowledgeBox = new CheckBox
        {
            AutoSize = true,
            Margin = new Padding(0, 0, 0, 16),
        };
        _acknowledgeBox.CheckedChanged += (_, _) => _installButton.Enabled = _acknowledgeBox.Checked;

        _progressBar = new ProgressBar
        {
            Dock = DockStyle.Fill,
            Height = 18,
            Margin = new Padding(0, 0, 0, 8),
        };

        _statusLabel = new Label
        {
            AutoSize = true,
            Margin = new Padding(0, 0, 0, 16),
        };

        var buttonRow = new FlowLayoutPanel
        {
            Dock = DockStyle.Fill,
            FlowDirection = FlowDirection.RightToLeft,
            AutoSize = true,
        };

        _installButton = new Button
        {
            AutoSize = true,
            Enabled = false,
            Padding = new Padding(16, 8, 16, 8),
        };
        _installButton.Click += async (_, _) => await HandleInstallAsync();

        _cancelButton = new Button
        {
            AutoSize = true,
            Padding = new Padding(16, 8, 16, 8),
        };
        _cancelButton.Click += (_, _) => Close();

        buttonRow.Controls.Add(_installButton);
        buttonRow.Controls.Add(_cancelButton);

        panel.Controls.Add(_headingLabel, 0, 0);
        panel.Controls.Add(_subheadingLabel, 0, 1);
        panel.Controls.Add(languageRow, 0, 2);
        panel.Controls.Add(_privacyHeadingLabel, 0, 3);
        panel.Controls.Add(_privacyBodyBox, 0, 4);
        panel.Controls.Add(installRow, 0, 5);
        panel.Controls.Add(_acknowledgeBox, 0, 6);
        panel.Controls.Add(_progressBar, 0, 7);
        panel.Controls.Add(_statusLabel, 0, 8);
        panel.Controls.Add(buttonRow, 0, 9);

        Controls.Add(panel);
        _languageSelector.SelectedIndex = _language switch
        {
            InstallerLanguage.ZhCn => 0,
            InstallerLanguage.JaJp => 2,
            _ => 1,
        };
        ApplyText();
    }

    private void ApplyText()
    {
        var text = InstallerTexts.Get(_language);
        Text = text.WindowTitle;
        _headingLabel.Text = text.Heading;
        _subheadingLabel.Text = text.Subheading;
        _languageLabel.Text = text.LanguageLabel;
        _privacyHeadingLabel.Text = text.PrivacyHeading;
        _privacyBodyBox.Text = text.PrivacyBody;
        _installLocationLabel.Text = text.InstallLocationLabel;
        _browseButton.Text = text.BrowseButton;
        _acknowledgeBox.Text = text.AcknowledgeText;
        _installButton.Text = text.InstallButton;
        _cancelButton.Text = text.CancelButton;
        _statusLabel.Text = text.InstallingText;
    }

    private void HandleBrowse(object? sender, EventArgs e)
    {
        var text = InstallerTexts.Get(_language);
        using var dialog = new FolderBrowserDialog
        {
            Description = text.BrowseTitle,
            SelectedPath = _installPathBox.Text,
            ShowNewFolderButton = true,
        };

        if (dialog.ShowDialog(this) == DialogResult.OK)
        {
            _installPathBox.Text = dialog.SelectedPath;
        }
    }

    private async Task HandleInstallAsync()
    {
        var text = InstallerTexts.Get(_language);
        var installDir = _installPathBox.Text.Trim();
        if (string.IsNullOrWhiteSpace(installDir))
        {
            return;
        }

        if (Directory.Exists(installDir) && Directory.EnumerateFileSystemEntries(installDir).Any())
        {
            var overwrite = MessageBox.Show(
                text.ExistingInstallPrompt,
                text.ExistingInstallTitle,
                MessageBoxButtons.YesNo,
                MessageBoxIcon.Question);

            if (overwrite != DialogResult.Yes)
            {
                return;
            }
        }

        ToggleBusy(true);
        _statusLabel.Text = text.WritingFilesStatus;

        try
        {
            await Task.Run(() => InstallPayload(installDir, text));

            var result = MessageBox.Show(
                $"{text.InstallCompleteBody}\n\n{installDir}",
                text.InstallCompleteTitle,
                MessageBoxButtons.YesNo,
                MessageBoxIcon.Information,
                MessageBoxDefaultButton.Button1);

            if (result == DialogResult.Yes)
            {
                Process.Start(new ProcessStartInfo
                {
                    FileName = Path.Combine(installDir, "EaaSE.exe"),
                    WorkingDirectory = installDir,
                    UseShellExecute = true,
                });
            }

            Close();
        }
        catch (Exception ex)
        {
            MessageBox.Show(
                $"{text.InstallFailedBody}\n\n{ex}",
                text.InstallFailedTitle,
                MessageBoxButtons.OK,
                MessageBoxIcon.Error);
            ToggleBusy(false);
            _statusLabel.Text = text.InstallingText;
        }
    }

    private void ToggleBusy(bool busy)
    {
        _installButton.Enabled = !busy && _acknowledgeBox.Checked;
        _cancelButton.Enabled = !busy;
        _browseButton.Enabled = !busy;
        _installPathBox.Enabled = !busy;
        _languageSelector.Enabled = !busy;
        _acknowledgeBox.Enabled = !busy;
        _progressBar.Style = busy ? ProgressBarStyle.Marquee : ProgressBarStyle.Blocks;
    }

    private void InstallPayload(string installDir, InstallerText text)
    {
        var tempRoot = Path.Combine(Path.GetTempPath(), "EaaSEInstaller", Guid.NewGuid().ToString("N"));
        var payloadZipPath = Path.Combine(tempRoot, "payload.zip");
        var extractDir = Path.Combine(tempRoot, "extract");

        Directory.CreateDirectory(tempRoot);
        Directory.CreateDirectory(extractDir);
        Directory.CreateDirectory(installDir);

        try
        {
            var assembly = Assembly.GetExecutingAssembly();
            using (var resourceStream = assembly.GetManifestResourceStream("EaaSEInstaller.PayloadZip"))
            {
                if (resourceStream is null)
                {
                    throw new InvalidOperationException("Installer payload is missing.");
                }

                using var fileStream = File.Create(payloadZipPath);
                resourceStream.CopyTo(fileStream);
            }

            ZipFile.ExtractToDirectory(payloadZipPath, extractDir, overwriteFiles: true);
            CopyDirectory(extractDir, installDir);

            Invoke(new Action(() => _statusLabel.Text = text.CreatingShortcutStatus));
            CreateShortcut(
                Path.Combine(
                    Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory),
                    "EaaSE.lnk"),
                Path.Combine(installDir, "EaaSE.exe"),
                installDir);

            var startMenuDir = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.Programs),
                "EaaSE");
            Directory.CreateDirectory(startMenuDir);
            CreateShortcut(
                Path.Combine(startMenuDir, "EaaSE.lnk"),
                Path.Combine(installDir, "EaaSE.exe"),
                installDir);

            WritePrivacyNotice(installDir);
            Invoke(new Action(() => _statusLabel.Text = text.FinalizingStatus));
        }
        finally
        {
            try
            {
                if (Directory.Exists(tempRoot))
                {
                    Directory.Delete(tempRoot, true);
                }
            }
            catch
            {
            }
        }
    }

    private static void CopyDirectory(string sourceDir, string destinationDir)
    {
        foreach (var directory in Directory.GetDirectories(sourceDir, "*", SearchOption.AllDirectories))
        {
            Directory.CreateDirectory(directory.Replace(sourceDir, destinationDir));
        }

        foreach (var file in Directory.GetFiles(sourceDir, "*", SearchOption.AllDirectories))
        {
            var target = file.Replace(sourceDir, destinationDir);
            Directory.CreateDirectory(Path.GetDirectoryName(target)!);
            File.Copy(file, target, true);
        }
    }

    private static void CreateShortcut(string shortcutPath, string targetPath, string workingDirectory)
    {
        var shellType = Type.GetTypeFromProgID("WScript.Shell")
            ?? throw new InvalidOperationException("WScript.Shell is unavailable.");
        dynamic shell = Activator.CreateInstance(shellType)
            ?? throw new InvalidOperationException("Failed to create WScript.Shell.");
        dynamic shortcut = shell.CreateShortcut(shortcutPath);
        shortcut.TargetPath = targetPath;
        shortcut.WorkingDirectory = workingDirectory;
        shortcut.Save();
    }

    private static void WritePrivacyNotice(string installDir)
    {
        var content =
            "简体中文\r\n" +
            "EaaSE 仅在本机运行。软件不会上传 Excel、配置、搜索词、命中结果或其他用户数据。软件仅在本地保存与软件故障相关的运行日志，用于启动失败、缺失依赖和异常排查。\r\n\r\n" +
            "English\r\n" +
            "EaaSE runs locally only. The software does not upload Excel files, configuration files, search terms, hit results, or any other user data. It stores only local diagnostic logs related to software defects and troubleshooting.\r\n\r\n" +
            "日本語\r\n" +
            "EaaSE はローカル専用で動作します。Excel、設定、検索語、ヒット結果、その他のユーザーデータをアップロードしません。ソフトウェア不具合の調査に必要な診断ログのみをローカルに保存します。\r\n";

        File.WriteAllText(Path.Combine(installDir, "PRIVACY_NOTICE.txt"), content);
    }
}
