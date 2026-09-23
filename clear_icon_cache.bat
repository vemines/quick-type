@echo off
chcp 65001 >nul
title Khôi phục & Xóa Cache Icon Windows - Quick Type
echo ====================================================================
echo         ĐANG TIẾN HÀNH XÓA & TẢI LẠI CACHE ICON WINDOWS
echo ====================================================================
echo.

echo [1/4] Đang đóng tiến trình Windows Explorer...
taskkill /f /im explorer.exe >nul 2>&1

echo [2/4] Đang xóa bộ nhớ đệm IconCache.db...
cd /d "%localappdata%"
if exist IconCache.db (
    attrib -h -r -s IconCache.db >nul 2>&1
    del /f /q IconCache.db >nul 2>&1
)

echo [3/4] Đang xóa các tệp iconcache_*.db và thumbcache_*.db...
cd /d "%localappdata%\Microsoft\Windows\Explorer"
attrib -h -r -s iconcache_*.db >nul 2>&1
del /f /q iconcache_*.db >nul 2>&1
attrib -h -r -s thumbcache_*.db >nul 2>&1
del /f /q thumbcache_*.db >nul 2>&1

echo [4/4] Đang khởi động lại Windows Explorer...
start explorer.exe

echo.
echo ====================================================================
echo    ĐÃ LÀM MỚI CACHE ICON THÀNH CÔNG!
echo ====================================================================
echo.
pause
