using OtpNet;
using QRCoder;

namespace Jaza.Infrastructure.Identity;

public interface ITotpService
{
    (string sharedKey, string authenticatorUri, string qrCodePngDataUrl) Enroll(string issuer, string accountName);
    bool Verify(string base32Key, string code);
    IReadOnlyList<string> GenerateBackupCodes(int count = 10);
}

public sealed class TotpService : ITotpService
{
    public (string sharedKey, string authenticatorUri, string qrCodePngDataUrl) Enroll(string issuer, string accountName)
    {
        var keyBytes = KeyGeneration.GenerateRandomKey(20);
        var sharedKey = Base32Encoding.ToString(keyBytes);
        var uri = $"otpauth://totp/{Uri.EscapeDataString(issuer)}:{Uri.EscapeDataString(accountName)}?secret={sharedKey}&issuer={Uri.EscapeDataString(issuer)}&digits=6&period=30";

        using var qr = new QRCodeGenerator();
        using var data = qr.CreateQrCode(uri, QRCodeGenerator.ECCLevel.Q);
        var png = new PngByteQRCode(data).GetGraphic(8);
        var dataUrl = "data:image/png;base64," + Convert.ToBase64String(png);

        return (sharedKey, uri, dataUrl);
    }

    public bool Verify(string base32Key, string code)
    {
        if (string.IsNullOrWhiteSpace(code) || code.Length is < 6 or > 8) return false;
        var totp = new Totp(Base32Encoding.ToBytes(base32Key));
        return totp.VerifyTotp(code, out _, new VerificationWindow(previous: 1, future: 1));
    }

    public IReadOnlyList<string> GenerateBackupCodes(int count = 10)
    {
        var rng = System.Security.Cryptography.RandomNumberGenerator.Create();
        var codes = new List<string>(count);
        for (var i = 0; i < count; i++)
        {
            var b = new byte[5];
            rng.GetBytes(b);
            codes.Add(Convert.ToHexStringLower(b));
        }
        return codes;
    }
}
