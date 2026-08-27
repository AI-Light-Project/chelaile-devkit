"""
Vercel Serverless Function - 车来了 DevKit API
将 Flask 应用通过 test client 适配到 Vercel Python Runtime
"""
import sys
import os
import json

# 添加项目根目录到 Python 路径
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BASE_DIR)

from server import app  # noqa: E402


def handler(request, response):
    """
    Vercel Python Runtime handler 函数

    Args:
        request: Vercel 请求对象，包含 method, path, headers, query_params, body 等
        response: Vercel 响应对象，可设置 status_code, headers，return body

    Returns:
        响应体字符串
    """
    method = request.method or 'GET'
    path = request.path or '/'
    query_params = request.query_params or {}
    headers = request.headers or {}
    body = request.body or ''

    # 使用 Flask test client 发起请求
    with app.test_client() as client:
        # 构建请求头
        test_headers = {}
        for k, v in headers.items():
            if k.lower() not in ('host', 'content-length'):
                test_headers[k] = v

        # 构建 URL（带 query string）
        url = path
        if query_params:
            from urllib.parse import urlencode
            url = f"{path}?{urlencode(query_params)}"

        # 发起请求
        kwargs = {
            'method': method,
            'headers': test_headers,
        }
        if body and method.upper() in ('POST', 'PUT', 'PATCH'):
            kwargs['data'] = body
            if 'content-type' not in {k.lower(): v for k, v in test_headers.items()}:
                test_headers['Content-Type'] = 'application/json'
                kwargs['headers'] = test_headers

        resp = client.open(url, **kwargs)

        # 设置响应状态码
        response.status_code = resp.status_code

        # 设置响应头
        for key, value in resp.headers.items():
            if key.lower() not in ('content-length', 'server', 'date'):
                response.headers[key] = value

        # 返回响应体
        resp_data = resp.get_data(as_text=True)
        return resp_data
