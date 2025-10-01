# سكريپت تثبيت MongoDB Database Tools
Write-Host "🔧 تثبيت MongoDB Database Tools..." -ForegroundColor Green

# التحقق من وجود Chocolatey
if (Get-Command choco -ErrorAction SilentlyContinue) {
    Write-Host "✅ Chocolatey موجود، جاري تثبيت MongoDB Tools..." -ForegroundColor Green
    choco install mongodb-database-tools -y
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ تم تثبيت MongoDB Tools بنجاح!" -ForegroundColor Green
        Write-Host "🔄 إعادة تشغيل PowerShell مطلوبة لتحديث PATH" -ForegroundColor Yellow
    } else {
        Write-Host "❌ فشل في تثبيت MongoDB Tools عبر Chocolatey" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️ Chocolatey غير مثبت" -ForegroundColor Yellow
    Write-Host "📥 تحميل MongoDB Database Tools يدوياً..." -ForegroundColor Cyan
    
    # رابط التحميل المباشر
    $downloadUrl = "https://fastdl.mongodb.org/tools/db/mongodb-database-tools-windows-x86_64-100.9.4.zip"
    $downloadPath = "$env:TEMP\mongodb-tools.zip"
    $extractPath = "C:\mongodb-tools"
    
    try {
        Write-Host "📥 جاري التحميل من: $downloadUrl" -ForegroundColor Cyan
        Invoke-WebRequest -Uri $downloadUrl -OutFile $downloadPath -UseBasicParsing
        
        Write-Host "📂 جاري الاستخراج إلى: $extractPath" -ForegroundColor Cyan
        Expand-Archive -Path $downloadPath -DestinationPath $extractPath -Force
        
        # إضافة إلى PATH
        $binPath = "$extractPath\mongodb-database-tools-windows-x86_64-100.9.4\bin"
        $currentPath = [Environment]::GetEnvironmentVariable("PATH", "User")
        
        if ($currentPath -notlike "*$binPath*") {
            Write-Host "🔧 إضافة إلى PATH..." -ForegroundColor Cyan
            [Environment]::SetEnvironmentVariable("PATH", "$currentPath;$binPath", "User")
            $env:PATH += ";$binPath"
        }
        
        Write-Host "✅ تم تثبيت MongoDB Tools بنجاح!" -ForegroundColor Green
        Write-Host "📍 المسار: $binPath" -ForegroundColor Gray
        
        # تنظيف
        Remove-Item $downloadPath -Force
        
    } catch {
        Write-Host "❌ فشل في التحميل: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "💡 يرجى التحميل يدوياً من: https://www.mongodb.com/try/download/database-tools" -ForegroundColor Yellow
    }
}

Write-Host "`n🧪 اختبار التثبيت..." -ForegroundColor Cyan
try {
    $version = & mongodump --version 2>$null
    if ($version) {
        Write-Host "✅ mongodump يعمل بنجاح!" -ForegroundColor Green
        Write-Host "📋 الإصدار: $($version[0])" -ForegroundColor Gray
        
        Write-Host "`n🚀 يمكنك الآن تشغيل عملية النقل:" -ForegroundColor Green
        Write-Host "mongodump --host localhost:27017 --db basma_db --out backup_local" -ForegroundColor Yellow
        Write-Host "mongorestore --uri `"mongodb+srv://basmatdesign:basma1234@cluster0.0wetdkc.mongodb.net/basma_db`" --drop backup_local/basma_db" -ForegroundColor Yellow
        
    } else {
        Write-Host "⚠️ mongodump غير متاح في PATH" -ForegroundColor Yellow
        Write-Host "🔄 قم بإعادة تشغيل PowerShell وجرب مرة أخرى" -ForegroundColor Cyan
    }
} catch {
    Write-Host "⚠️ mongodump غير متاح، قد تحتاج إعادة تشغيل PowerShell" -ForegroundColor Yellow
}

Write-Host "`n📖 للمساعدة، راجع: MIGRATION_INSTRUCTIONS.md" -ForegroundColor Cyan
