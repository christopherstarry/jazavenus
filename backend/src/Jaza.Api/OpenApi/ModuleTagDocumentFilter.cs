using Microsoft.OpenApi;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace Jaza.Api.OpenApi;

/// <summary>Ensures every module tag has a description and appears in alphabetical order.</summary>
internal sealed class ModuleTagDocumentFilter : IDocumentFilter
{
    public void Apply(OpenApiDocument swaggerDoc, DocumentFilterContext context)
    {
        var tags = swaggerDoc.Tags?.ToList() ?? [];

        foreach (var (name, description) in ModuleTags.Descriptions)
        {
            var tag = tags.Find(t => string.Equals(t.Name, name, StringComparison.Ordinal));
            if (tag is null)
            {
                tags.Add(new OpenApiTag { Name = name, Description = description });
            }
            else
            {
                tag.Description = description;
            }
        }

        swaggerDoc.Tags = new SortedSet<OpenApiTag>(
            tags,
            Comparer<OpenApiTag>.Create((a, b) => string.Compare(a.Name, b.Name, StringComparison.Ordinal)));
    }
}
