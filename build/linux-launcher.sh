#!/bin/sh
# Launcher for the SpinShare Electron binary on Linux.
#
# When launched from Steam, Steam injects its overlay via
# LD_PRELOAD into every process. The overlay crashes Chromium's GPU process.
# This script strips Steam's overlay from LD_PRELOAD before launching the Electron binary.

if [ -n "$LD_PRELOAD" ]; then
    cleaned=""
    old_ifs="$IFS"
    IFS=': '
    for lib in $LD_PRELOAD; do
        case "$lib" in
            *gameoverlayrenderer.so) ;;
            *) cleaned="${cleaned:+$cleaned:}$lib" ;;
        esac
    done
    IFS="$old_ifs"

    if [ -n "$cleaned" ]; then
        export LD_PRELOAD="$cleaned"
    else
        unset LD_PRELOAD
    fi
fi

# Resolve symlinks
here="$(dirname "$(readlink -f "$0")")"
exec "$here/spinshare-client-next.bin" "$@"
