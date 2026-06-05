# 扫描缺少tags字段的Markdown文件
Get-ChildItem 'F:\SelfJob\PortableKnowledge\source\' -Recurse -Filter *.md | ForEach-Object {
    $filePath = $_.FullName
    $content = Get-Content $filePath -First 50
    $frontMatter = $false
    $hasTags = $false
    foreach ($line in $content) {
        if ($line -eq '---') {
            $frontMatter = !$frontMatter
        } elseif ($frontMatter -and $line -match '^tags:') {
            $hasTags = $true
            break
        }
    }
    if (-not $hasTags) {
        $filePath
    }
}
