$ErrorActionPreference = 'Stop'

Add-Type -AssemblyName System.Drawing

$outDir = "C:\SE\Spring.2026\WDP\Healthmate\generated"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null
$outPath = Join-Path $outDir "register_sequence_diagram.png"

$width = 1800
$height = 1200
$bmp = New-Object System.Drawing.Bitmap $width, $height
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$g.Clear([System.Drawing.Color]::White)

$fontTitle = New-Object System.Drawing.Font("Segoe UI", 22, [System.Drawing.FontStyle]::Bold)
$fontHeader = New-Object System.Drawing.Font("Segoe UI", 11, [System.Drawing.FontStyle]::Bold)
$fontText = New-Object System.Drawing.Font("Segoe UI", 10)
$fontSmall = New-Object System.Drawing.Font("Segoe UI", 9)
$fontAlt = New-Object System.Drawing.Font("Segoe UI", 9, [System.Drawing.FontStyle]::Bold)

$brushBlack = [System.Drawing.Brushes]::Black
$brushWhite = [System.Drawing.Brushes]::White
$brushGray = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(245,245,245))
$brushLightBlue = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(235,244,255))
$brushAlt = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(250,250,250))
$penBlack = New-Object System.Drawing.Pen ([System.Drawing.Color]::Black, 1.5)
$penGray = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(130,130,130), 1)
$penGray.DashStyle = [System.Drawing.Drawing2D.DashStyle]::Dash
$penBlue = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(59,130,246), 1.8)

function Draw-Arrow {
    param(
        [int]$x1,
        [int]$y,
        [int]$x2,
        [string]$label,
        [bool]$dashed = $false
    )

    $pen = if ($dashed) {
        $p = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(31,41,55), 1.5)
        $p.DashStyle = [System.Drawing.Drawing2D.DashStyle]::Dash
        $p
    } else {
        New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(31,41,55), 1.5)
    }

    $g.DrawLine($pen, $x1, $y, $x2, $y)

    $arrowSize = 7
    if ($x2 -ge $x1) {
        $points = [System.Drawing.Point[]]@(
            (New-Object System.Drawing.Point -ArgumentList ([int]$x2), ([int]$y)),
            (New-Object System.Drawing.Point -ArgumentList ([int]($x2 - $arrowSize)), ([int]($y - 4))),
            (New-Object System.Drawing.Point -ArgumentList ([int]($x2 - $arrowSize)), ([int]($y + 4)))
        )
        $g.FillPolygon([System.Drawing.Brushes]::Black, $points)
    } else {
        $points = [System.Drawing.Point[]]@(
            (New-Object System.Drawing.Point -ArgumentList ([int]$x2), ([int]$y)),
            (New-Object System.Drawing.Point -ArgumentList ([int]($x2 + $arrowSize)), ([int]($y - 4))),
            (New-Object System.Drawing.Point -ArgumentList ([int]($x2 + $arrowSize)), ([int]($y + 4)))
        )
        $g.FillPolygon([System.Drawing.Brushes]::Black, $points)
    }

    $labelWidth = [int]($g.MeasureString($label, $fontText).Width) + 10
    $labelX = [Math]::Min($x1, $x2) + [Math]::Abs($x2 - $x1 - $labelWidth) / 2
    $g.FillRectangle([System.Drawing.Brushes]::White, $labelX, $y - 16, $labelWidth, 14)
    $g.DrawString($label, $fontText, $brushBlack, $labelX + 4, $y - 17)

    $pen.Dispose()
}

$g.DrawString("Register Account - Sequence Diagram", $fontTitle, $brushBlack, 40, 25)

$participants = @(
    @{ Name = "Guest"; X = 110; Width = 110; Type = "actor" },
    @{ Name = "Register Page"; X = 320; Width = 150; Type = "box" },
    @{ Name = "User API"; X = 560; Width = 120; Type = "box" },
    @{ Name = "User Controller"; X = 790; Width = 145; Type = "box" },
    @{ Name = "User Model"; X = 1030; Width = 120; Type = "box" },
    @{ Name = "JWT Service"; X = 1260; Width = 130; Type = "box" },
    @{ Name = "MongoDB"; X = 1490; Width = 120; Type = "db" }
)

$topY = 95
$lifeTop = 150
$lifeBottom = 1120

foreach ($p in $participants) {
    $left = $p.X
    $w = $p.Width
    if ($p.Type -eq "actor") {
        $center = $left + ($w / 2)
        $g.FillEllipse($brushBlack, $center - 8, $topY + 2, 16, 16)
        $g.DrawLine($penBlack, $center, $topY + 18, $center, $topY + 48)
        $g.DrawLine($penBlack, $center - 14, $topY + 28, $center + 14, $topY + 28)
        $g.DrawLine($penBlack, $center, $topY + 48, $center - 12, $topY + 68)
        $g.DrawLine($penBlack, $center, $topY + 48, $center + 12, $topY + 68)
        $nameSize = $g.MeasureString($p.Name, $fontHeader)
        $g.DrawString($p.Name, $fontHeader, $brushBlack, $center - $nameSize.Width / 2, $topY + 74)
    } elseif ($p.Type -eq "db") {
        $rect = New-Object System.Drawing.Rectangle -ArgumentList $left, ($topY + 10), $w, 58
        $g.FillRectangle($brushLightBlue, $rect)
        $g.DrawRectangle($penBlack, $rect)
        $g.DrawEllipse($penBlack, $left, $topY + 2, $w, 16)
        $g.DrawEllipse($penBlack, $left, $topY + 60, $w, 16)
        $g.DrawString($p.Name, $fontHeader, $brushBlack, $left + 18, $topY + 28)
    } else {
        $rect = New-Object System.Drawing.Rectangle -ArgumentList $left, ($topY + 10), $w, 42
        $g.FillRectangle($brushGray, $rect)
        $g.DrawRectangle($penBlack, $rect)
        $textSize = $g.MeasureString($p.Name, $fontHeader)
        $textX = $left + ($w - $textSize.Width) / 2
        $textY = ($topY + 10) + (42 - $textSize.Height) / 2
        $g.DrawString($p.Name, $fontHeader, $brushBlack, $textX, $textY)
    }

    $cx = $left + ($w / 2)
    $g.DrawLine($penGray, $cx, $lifeTop, $cx, $lifeBottom)
}

$centers = @{}
foreach ($p in $participants) {
    $centers[$p.Name] = [int]($p.X + $p.Width / 2)
}

$messages = @(
    @{ From="Guest"; To="Register Page"; Y=175; Label="Open register screen"; Dashed=$false },
    @{ From="Guest"; To="Register Page"; Y=215; Label="Enter full name, email, password"; Dashed=$false },
    @{ From="Guest"; To="Register Page"; Y=255; Label="Submit form"; Dashed=$false },
    @{ From="Register Page"; To="Register Page"; Y=295; Label="Validate required fields"; Dashed=$false },
    @{ From="Register Page"; To="User API"; Y=335; Label="POST /api/users/register"; Dashed=$false },
    @{ From="User API"; To="User Controller"; Y=375; Label="registerUser()"; Dashed=$false },
    @{ From="User Controller"; To="User Model"; Y=415; Label="Check existing email"; Dashed=$false },
    @{ From="User Model"; To="MongoDB"; Y=455; Label="findOne({ email })"; Dashed=$false },
    @{ From="MongoDB"; To="User Model"; Y=495; Label="Existing user or null"; Dashed=$true }
)

foreach ($m in $messages) {
    $x1 = $centers[$m.From]
    $x2 = $centers[$m.To]
    if ($m.From -eq $m.To) {
        $g.DrawArc($penBlue, $x1 - 5, $m.Y - 14, 40, 24, 270, 270)
        $loopPoints = [System.Drawing.Point[]]@(
            (New-Object System.Drawing.Point -ArgumentList ([int]($x1 + 30)), ([int]$m.Y)),
            (New-Object System.Drawing.Point -ArgumentList ([int]($x1 + 22)), ([int]($m.Y - 4))),
            (New-Object System.Drawing.Point -ArgumentList ([int]($x1 + 22)), ([int]($m.Y + 4)))
        )
        $g.FillPolygon([System.Drawing.Brushes]::Black, $loopPoints)
        $g.FillRectangle([System.Drawing.Brushes]::White, $x1 + 36, $m.Y - 16, 150, 14)
        $g.DrawString($m.Label, $fontText, $brushBlack, $x1 + 40, $m.Y - 17)
    } else {
        Draw-Arrow -x1 $x1 -y $m.Y -x2 $x2 -label $m.Label -dashed $m.Dashed
    }
}

$altX = 720
$altY = 540
$altW = 870
$altH = 460
$g.DrawRectangle($penBlack, $altX, $altY, $altW, $altH)
$g.FillRectangle($brushAlt, $altX + 1, $altY + 1, $altW - 2, 22)
$g.DrawString("alt", $fontAlt, $brushBlack, $altX + 8, $altY + 4)
$midY = 690
$g.DrawLine($penGray, $altX, $midY, $altX + $altW, $midY)
$g.FillRectangle([System.Drawing.Brushes]::White, $altX + 14, $midY - 10, 140, 18)
$g.DrawString("else Email is unique", $fontSmall, $brushBlack, $altX + 18, $midY - 11)
$g.FillRectangle([System.Drawing.Brushes]::White, $altX + 14, $altY + 24, 135, 18)
$g.DrawString("Email already exists", $fontSmall, $brushBlack, $altX + 18, $altY + 23)

$altMessages = @(
    @{ From="User Controller"; To="User API"; Y=595; Label="400 Email already exists"; Dashed=$true },
    @{ From="User API"; To="Register Page"; Y=630; Label="Error response"; Dashed=$true },
    @{ From="Register Page"; To="Guest"; Y=665; Label="Show registration error"; Dashed=$true },

    @{ From="User Controller"; To="User Controller"; Y=735; Label="Hash password"; Dashed=$false },
    @{ From="User Controller"; To="User Model"; Y=775; Label="Create user"; Dashed=$false },
    @{ From="User Model"; To="MongoDB"; Y=815; Label="insert user document"; Dashed=$false },
    @{ From="MongoDB"; To="User Model"; Y=855; Label="Saved user"; Dashed=$true },
    @{ From="User Controller"; To="JWT Service"; Y=895; Label="Generate token"; Dashed=$false },
    @{ From="JWT Service"; To="User Controller"; Y=935; Label="JWT token"; Dashed=$true },
    @{ From="User Controller"; To="User API"; Y=975; Label="201 User + token"; Dashed=$true },
    @{ From="User API"; To="Register Page"; Y=1015; Label="Success response"; Dashed=$true },
    @{ From="Register Page"; To="Register Page"; Y=1055; Label="Save token and user in localStorage"; Dashed=$false },
    @{ From="Register Page"; To="Guest"; Y=1095; Label="Redirect to onboarding"; Dashed=$true }
)

foreach ($m in $altMessages) {
    $x1 = $centers[$m.From]
    $x2 = $centers[$m.To]
    if ($m.From -eq $m.To) {
        $g.DrawArc($penBlue, $x1 - 5, $m.Y - 14, 40, 24, 270, 270)
        $loopPoints = [System.Drawing.Point[]]@(
            (New-Object System.Drawing.Point -ArgumentList ([int]($x1 + 30)), ([int]$m.Y)),
            (New-Object System.Drawing.Point -ArgumentList ([int]($x1 + 22)), ([int]($m.Y - 4))),
            (New-Object System.Drawing.Point -ArgumentList ([int]($x1 + 22)), ([int]($m.Y + 4)))
        )
        $g.FillPolygon([System.Drawing.Brushes]::Black, $loopPoints)
        $g.FillRectangle([System.Drawing.Brushes]::White, $x1 + 36, $m.Y - 16, 240, 14)
        $g.DrawString($m.Label, $fontText, $brushBlack, $x1 + 40, $m.Y - 17)
    } else {
        Draw-Arrow -x1 $x1 -y $m.Y -x2 $x2 -label $m.Label -dashed $m.Dashed
    }
}

$bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose()
$bmp.Dispose()

Write-Output $outPath
