using System;
using System.Drawing;
using System.IO;
using System.Threading.Tasks;
using System.Windows.Forms;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;

internal static class Program
{
    [STAThread]
    private static void Main()
    {
        Application.EnableVisualStyles();
        Application.SetCompatibleTextRenderingDefault(false);
        Application.Run(new GameWindow());
    }
}

internal sealed partial class GameWindow : Form
{
    private const string GameHost = "project-x.example";
    private readonly WebView2 view = new WebView2 { Dock = DockStyle.Fill };
    private bool closing;

    internal GameWindow()
    {
        Text = "Project X - Benteng Lembah";
        StartPosition = FormStartPosition.CenterScreen;
        ClientSize = new Size(1280, 800);
        MinimumSize = new Size(640, 480);
        WindowState = FormWindowState.Maximized;
        BackColor = Color.FromArgb(21, 29, 21);
        Controls.Add(view);
        Shown += StartGame;
        FormClosing += SaveOnClose;
    }

    private async void StartGame(object sender, EventArgs args)
    {
        try
        {
            var content = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "game");
            if (!File.Exists(Path.Combine(content, "web", "index.html")))
                throw new FileNotFoundException("Ekstrak semua isi ZIP sebelum membuka Project X.");
            var data = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                "Project X", "Benteng Lembah");
#if SMOKE_TEST
            data = Environment.GetEnvironmentVariable("PROJECT_X_TEST_PROFILE") ?? data;
#endif
            var environment = await CoreWebView2Environment.CreateAsync(null, data);
            if (IsDisposed) return;
            await view.EnsureCoreWebView2Async(environment);
            if (IsDisposed) return;
            var core = view.CoreWebView2;
            core.Settings.AreDevToolsEnabled = false;
            core.Settings.AreDefaultContextMenusEnabled = false;
            core.Settings.AreBrowserAcceleratorKeysEnabled = false;
            core.SetVirtualHostNameToFolderMapping(GameHost, content, CoreWebView2HostResourceAccessKind.DenyCors);
            core.NavigationStarting += (s, e) =>
            {
                Uri uri;
                e.Cancel = !Uri.TryCreate(e.Uri, UriKind.Absolute, out uri) ||
                    uri.Scheme != Uri.UriSchemeHttps || uri.Host != GameHost;
            };
            core.NewWindowRequested += (s, e) => e.Handled = true;
            core.NavigationCompleted += (s, e) =>
            {
                if (!e.IsSuccess) Fail("Halaman game gagal dimuat (" + e.WebErrorStatus + ").");
            };
#if SMOKE_TEST
            core.NavigationCompleted += RunSmokeTest;
#endif
            core.Navigate("https://" + GameHost + "/web/index.html");
        }
        catch (WebView2RuntimeNotFoundException)
        {
            Fail("Microsoft Edge WebView2 Runtime diperlukan untuk membuka game.");
        }
        catch (Exception error)
        {
            Fail(error.Message);
        }
    }

    private async void SaveOnClose(object sender, FormClosingEventArgs args)
    {
        if (closing || view.CoreWebView2 == null) return;
        args.Cancel = true;
        try
        {
            var save = view.CoreWebView2.ExecuteScriptAsync("window.dispatchEvent(new Event('pagehide'))");
            await Task.WhenAny(save, Task.Delay(1000));
        }
        catch (InvalidOperationException) { }
        finally
        {
            closing = true;
            if (!IsDisposed) BeginInvoke(new Action(Close));
        }
    }

    private void Fail(string text)
    {
#if SMOKE_TEST
        if (!String.IsNullOrEmpty(Environment.GetEnvironmentVariable("PROJECT_X_TEST_RESULT")))
        {
            File.WriteAllText(Environment.GetEnvironmentVariable("PROJECT_X_TEST_RESULT"), text);
            Environment.ExitCode = 1;
            Close();
            return;
        }
#endif
        MessageBox.Show(this, text, Text, MessageBoxButtons.OK, MessageBoxIcon.Error);
        Close();
    }
}
