if ($env:Path -contains ";C:\Program Files\VideoLAN\VLC") { echo "PATH already contains the path to VLC" } else { [Environment]::SetEnvironmentVariable("PATH", $env:path + ";C:\Program Files\VideoLAN\VLC", "Machine"); echo "VLC added to PATH" }