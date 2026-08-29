# Local HTTP Server for Credit Recovery
$port = 8080
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Prefixes.Add("http://127.0.0.1:$port/")
$listener.Start()

Write-Host "=========================================="
Write-Host "Credit Recovery server is running!"
Write-Host "Open in browser: http://localhost:$port/"
Write-Host "=========================================="

$baseDir = $PSScriptRoot

$mimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".htm"  = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "text/javascript; charset=utf-8"
    ".mjs"  = "text/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".gif"  = "image/gif"
    ".svg"  = "image/svg+xml"
    ".ico"  = "image/x-icon"
}

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $path = $request.Url.LocalPath
        if ([string]::IsNullOrWhiteSpace($path) -or $path -eq "/") {
            $path = "/index.html"
        }

        $relPath = $path.TrimStart("/\").Replace("/", "\")
        $filePath = Join-Path $baseDir $relPath

        if (Test-Path $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $contentType = $mimeTypes[$ext]
            if (-not $contentType) {
                $contentType = "application/octet-stream"
            }

            $response.ContentType = $contentType
            $response.AddHeader("Access-Control-Allow-Origin", "*")
            $response.AddHeader("Access-Control-Allow-Methods", "GET, HEAD, POST, OPTIONS")
            $response.AddHeader("Access-Control-Allow-Headers", "*")

            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentLength64 = $bytes.Length

            if ($request.HttpMethod -ne "HEAD") {
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
            }
            $response.OutputStream.Close()
        } else {
            $response.StatusCode = 404
            $msg = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $path")
            $response.ContentType = "text/plain; charset=utf-8"
            $response.ContentLength64 = $msg.Length
            if ($request.HttpMethod -ne "HEAD") {
                $response.OutputStream.Write($msg, 0, $msg.Length)
            }
            $response.OutputStream.Close()
        }
    } catch {
        Write-Host "Request error: $_"
    }
}
