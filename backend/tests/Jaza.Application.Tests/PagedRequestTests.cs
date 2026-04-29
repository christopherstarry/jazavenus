using FluentAssertions;
using Jaza.Application.Common;
using Xunit;

namespace Jaza.Application.Tests;

public sealed class PagedRequestTests
{
    [Fact]
    public void Normalized_PageSizeAboveMax_IsCapped()
    {
        var q = new PagedRequest(PageSize: 500);
        var n = q.Normalized();
        n.PageSize.Should().Be(PagedRequest.MaxPageSize);
        n.Page.Should().Be(1);
    }

    [Fact]
    public void Normalized_PageBelowOne_IsOne()
    {
        var q = new PagedRequest(Page: -3, PageSize: 10);
        var n = q.Normalized();
        n.Page.Should().Be(1);
        n.PageSize.Should().Be(10);
    }

    [Fact]
    public void Normalized_PageSizeBelowOne_UsesDefault()
    {
        var q = new PagedRequest(PageSize: 0);
        var n = q.Normalized();
        n.PageSize.Should().Be(PagedRequest.DefaultPageSize);
    }

    [Fact]
    public void Normalized_AlreadyValid_IsUnchanged()
    {
        var q = new PagedRequest(Page: 2, PageSize: 20);
        var n = q.Normalized();
        n.Should().Be(q);
    }
}
