"""
This class exists to solve eventual circular deps 'db' variable in views.
"""
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()
