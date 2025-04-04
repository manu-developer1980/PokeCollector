$files = Get-ChildItem -Path "src", "supabase" -Recurse -Include "*.ts", "*.tsx", "*.js", "*.jsx"

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    $newContent = $content -replace '^\s*console\.log\(.*\);?\s*$', '' -replace '\s*console\.log\(.*\);', ''
    
    if ($content -ne $newContent) {
        Set-Content -Path $file.FullName -Value $newContent
        Write-Host "Removed console.log from $($file.FullName)"
    }
}

Write-Host "Finished removing console.log statements"
