import sys,time,urllib.request
url=sys.argv[1]
for attempt in range(30):
    try:
        with urllib.request.urlopen(url,timeout=2) as response:
            if response.status==200: sys.exit(0)
    except (OSError,TimeoutError):
        pass
    time.sleep(1)
sys.exit('Local preview did not become ready within the bounded startup window.')
