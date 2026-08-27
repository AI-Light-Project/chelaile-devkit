"""
Vercel Serverless Function - 车来了 DevKit
Vercel Python Runtime 会自动检测 Flask app 并作为 WSGI 应用运行
"""
import sys
import os

# 添加项目根目录到 Python 路径
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BASE_DIR)

from server import app  # noqa: E402,F401
