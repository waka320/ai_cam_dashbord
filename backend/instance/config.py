import os

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev_key')
    DEBUG = False

class DevelopmentConfig(Config):
    DEBUG = True
