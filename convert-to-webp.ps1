# convert-to-webp.ps1
# Конвертирует все PNG/JPG/JPEG в WebP прямо рядом с оригиналом.
# Оригиналы НЕ удаляются — они нужны как fallback в <picture>.

$cwebp = "C:\Users\Yu\AppData\Local\Microsoft\WinGet\Packages\Google.Libwebp_Microsoft.Winget.Source_8wekyb3d8bbwe\libwebp-1.6.0-windows-x64\bin\cwebp.exe"

$imgRoot = "d:\gitsite\Yurummi-site\img"

# Папки для конвертации (lore/save-video.mp4 пропускаем — это видео)
$folders = @("arts", "fanarts", "sketches", "slider", "lore")

$totalConverted = 0
$totalSkipped   = 0
$totalSavedKB   = 0

foreach ($folder in $folders) {
    $path = Join-Path $imgRoot $folder
    $images = Get-ChildItem -Path $path -Include "*.png","*.jpg","*.jpeg" -Recurse

    foreach ($img in $images) {
        $webpPath = [System.IO.Path]::ChangeExtension($img.FullName, ".webp")

        # Пропускаем, если WebP уже существует и свежее оригинала
        if (Test-Path $webpPath) {
            $webpFile = Get-Item $webpPath
            if ($webpFile.LastWriteTime -ge $img.LastWriteTime) {
                Write-Host "  SKIP (already exists): $($img.Name)" -ForegroundColor DarkGray
                $totalSkipped++
                continue
            }
        }

        $ext = $img.Extension.ToLower()

        # PNG -> WebP lossless (без потерь)
        # JPG/JPEG -> WebP lossy q=90 (почти незаметная потеря, -x4 сжатие)
        if ($ext -eq ".png") {
            $args = @("-lossless", "-z", "9", "-mt", "-quiet", $img.FullName, "-o", $webpPath)
        } else {
            $args = @("-q", "90", "-mt", "-quiet", $img.FullName, "-o", $webpPath)
        }

        & $cwebp @args

        if (Test-Path $webpPath) {
            $origKB  = [math]::Round($img.Length / 1KB, 1)
            $webpKB  = [math]::Round((Get-Item $webpPath).Length / 1KB, 1)
            $savedKB = $origKB - $webpKB
            $totalSavedKB += $savedKB
            $totalConverted++

            $color = if ($savedKB -gt 0) { "Green" } else { "Yellow" }
            Write-Host ("  OK: {0,-45} {1,8} KB -> {2,8} KB  (saves {3:+0.0;-0.0} KB)" -f $img.Name, $origKB, $webpKB, $savedKB) -ForegroundColor $color
        } else {
            Write-Host "  ERROR: $($img.Name)" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Конвертировано : $totalConverted файлов" -ForegroundColor Cyan
Write-Host "  Пропущено      : $totalSkipped файлов" -ForegroundColor DarkGray
Write-Host ("  Сэкономлено   : {0:N0} КБ ({1:N1} МБ)" -f $totalSavedKB, ($totalSavedKB / 1024)) -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
