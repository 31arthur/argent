# Fix imports script - Replace @/ with relative paths in functions directory

$files = Get-ChildItem -Path "functions\src\domain" -Recurse -Filter "*.ts"

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Determine relative path based on file location
    $relativePath = $file.DirectoryName.Replace((Get-Location).Path + "\functions\src\", "")
    $depth = ($relativePath -split "\\").Count
    
    # Calculate how many ../ needed to get to src root
    $upLevels = "../" * $depth
    
    # Replace @/domain imports
    $content = $content -replace "from '@/domain/entities/", "from '$($upLevels)domain/entities/"
    $content = $content -replace "from '@/domain/repositories/", "from '$($upLevels)domain/repositories/"
    $content = $content -replace "from '@/domain/services/", "from '$($upLevels)domain/services/"
    $content = $content -replace "from '@/domain/usecases/", "from '$($upLevels)domain/usecases/"
    $content = $content -replace "from '@/domain/value-objects/", "from '$($upLevels)domain/entities/"
    
    # Replace @/data imports
    $content = $content -replace "from '@/data/", "from '$($upLevels)data/"
    
    # Import type syntax
    $content = $content -replace "import type \{([^}]+)\} from '@/domain/entities/", "import type {`$1} from '$($upLevels)domain/entities/"
    $content = $content -replace "import type \{([^}]+)\} from '@/domain/repositories/", "import type {`$1} from '$($upLevels)domain/repositories/"
    $content = $content -replace "import type \{([^}]+)\} from '@/domain/services/", "import type {`$1} from '$($upLevels)domain/services/"
    $content = $content -replace "import type \{([^}]+)\} from '@/domain/value-objects/", "import type {`$1} from '$($upLevels)domain/entities/"
    
    # Only write if content changed
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Fixed imports in: $($file.Name)"
    }
}

Write-Host "`nImport path fixing complete!"
