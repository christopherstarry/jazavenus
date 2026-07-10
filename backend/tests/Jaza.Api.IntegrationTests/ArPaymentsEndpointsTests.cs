using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Jaza.Application.Ar;
using Jaza.Application.Invoicing;
using Jaza.Application.MasterData;
using Jaza.Domain.Ar;
using Jaza.Domain.Invoicing;
using Xunit;

namespace Jaza.Api.IntegrationTests;

[Collection(nameof(PostgresCollection))]
public sealed class ArPaymentsEndpointsTests(PostgresFixture fx)
{
    [Fact]
    public async Task CreateBatch_EmptyAllocations_ReturnsBadRequest()
    {
        var client = await IntegrationTestClient.LoginAsync(fx, "superadmin@jaza.local");
        var customerId = await SeedCustomerAsync(client);

        var resp = await client.PostAsJsonAsync("/api/ar/payments", new BatchPaymentDto(
            customerId, DateTime.UtcNow, PaymentMethod.Cash, "IDR", null, null, []));

        resp.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CreateBatch_AgainstPostedInvoice_AllocatesPayment()
    {
        var client = await IntegrationTestClient.LoginAsync(fx, "superadmin@jaza.local");
        var customerId = await SeedCustomerAsync(client);
        var invoiceId = await CreatePostedInvoiceAsync(client, customerId, 300m);

        var pay = await client.PostAsJsonAsync("/api/ar/payments", new BatchPaymentDto(
            customerId, DateTime.UtcNow, PaymentMethod.BankTransfer, "IDR", "TRX-1", null,
            [new PaymentAllocationDto(invoiceId, 300m, "full")]));

        pay.IsSuccessStatusCode.Should().BeTrue();
        var result = await pay.Content.ReadFromJsonAsync<BatchPaymentResult>();
        result!.TotalAmount.Should().Be(300m);

        var inv = await client.GetFromJsonAsync<InvoiceDto>($"/api/invoices/{invoiceId}");
        inv!.Status.Should().Be(InvoiceStatus.Paid);
    }

    private static async Task<Guid> SeedCustomerAsync(HttpClient client)
    {
        var resp = await client.PostAsJsonAsync("/api/master/customers",
            IntegrationTestClient.NewCustomer($"P{Guid.NewGuid():N}"[..8], "Pay Customer", 5_000_000m));
        return (await resp.Content.ReadFromJsonAsync<CustomerDto>())!.Id;
    }

    private static async Task<Guid> CreatePostedInvoiceAsync(HttpClient client, Guid customerId, decimal amount)
    {
        var create = await client.PostAsJsonAsync("/api/invoices", new InvoiceUpsertDto(
            customerId, null,
            DateTime.UtcNow.Date, DateTime.UtcNow.Date.AddDays(30),
            "IDR", null,
            [new InvoiceUpsertLineDto(1, null, "Service fee", 1, amount)]));

        create.IsSuccessStatusCode.Should().BeTrue();
        var inv = (await create.Content.ReadFromJsonAsync<InvoiceDto>())!;

        var post = await client.PostAsync($"/api/invoices/{inv.Id}/post", content: null);
        post.IsSuccessStatusCode.Should().BeTrue();
        return inv.Id;
    }
}
