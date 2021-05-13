"""
This file defines the database models
"""

import datetime
from .common import db, Field, auth
from pydal.validators import *


def get_user_email():
    return auth.current_user.get('email') if auth.current_user else None

def get_time():
    return datetime.datetime.utcnow()


### Define your table below
#
# db.define_table('thing', Field('name'))
#
## always commit your models to avoid problems later

db.define_table(
    'drawing',
    Field('title', requires=IS_NOT_EMPTY()),
    Field('image_data', requires=IS_NOT_EMPTY()),
    Field('user_email', default=get_user_email),
)
db.drawing.user_email.readable = db.drawing.user_email.writable = False 

db.define_table(
	'friend_code',
	Field('uuid', requires=IS_NOT_EMPTY()),
    Field('user_email', default=get_user_email),
)

db.commit()
