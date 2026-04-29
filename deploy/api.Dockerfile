FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY backend/Directory.Build.props backend/Directory.Packages.props backend/global.json ./
COPY backend/Jaza.Venus.sln ./
COPY backend/src/ ./src/
COPY backend/tests/ ./tests/
RUN dotnet restore Jaza.Venus.sln
RUN dotnet publish src/Jaza.Api/Jaza.Api.csproj -c Release -o /app /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends curl libfontconfig1 \
 && rm -rf /var/lib/apt/lists/*
RUN groupadd -r jaza && useradd -r -g jaza -s /usr/sbin/nologin jaza
COPY --from=build /app .
RUN mkdir -p /app/logs && chown -R jaza:jaza /app
USER jaza
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --retries=5 CMD curl -fsS http://localhost:8080/health || exit 1
ENTRYPOINT ["dotnet", "Jaza.Api.dll"]
