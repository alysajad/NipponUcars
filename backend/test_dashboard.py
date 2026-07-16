import asyncio
from main import get_cms_dashboard

async def main():
    try:
        res = await get_cms_dashboard()
        print(res)
    except Exception as e:
        print("EXCEPTION:", e)

asyncio.run(main())
