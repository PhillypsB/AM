"""Local read-only preview. Usage: python tools/serve.py --data ../DATOS_PNCM"""
from pathlib import Path
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import unquote, urlsplit
import argparse

parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--data',type=Path,default=Path(__file__).resolve().parents[2]/'DATOS_PNCM')
parser.add_argument('--port',type=int,default=8765)
args=parser.parse_args()
app=Path(__file__).resolve().parents[1]
data=args.data.resolve()
if not (data/'mensual/BD/manifest.js').is_file():
    parser.error('--data must point to DATOS_PNCM containing mensual/BD/manifest.js')

class Handler(SimpleHTTPRequestHandler):
    def translate_path(self,url):
        pathname=unquote(urlsplit(url).path)
        for prefix,base in [('/am/',app),('/DATOS_PNCM/',data)]:
            if pathname.startswith(prefix):
                candidate=(base/pathname[len(prefix):]).resolve()
                if candidate.is_relative_to(base):return str(candidate)
        return str(app/'__not_found__')
    def do_GET(self):
        if self.path=='/':
            self.send_response(302);self.send_header('Location','/am/');self.end_headers();return
        if self.path.startswith('/_vercel/insights/'):
            self.send_response(204);self.end_headers();return
        super().do_GET()
    def end_headers(self):
        self.send_header('X-Content-Type-Options','nosniff')
        super().end_headers()

print(f'Open http://127.0.0.1:{args.port}/am/',flush=True)
ThreadingHTTPServer(('127.0.0.1',args.port),Handler).serve_forever()
