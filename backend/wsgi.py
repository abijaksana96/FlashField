from asgiref.wsgi import WsgiToAsgi, AsgiToWsgi
from app.main import app

# Wrap FastAPI (ASGI) app menjadi WSGI app agar bisa jalan di PythonAnywhere
application = AsgiToWsgi(app)
