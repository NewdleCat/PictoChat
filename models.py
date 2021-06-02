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
    Field('date_added', type="datetime", default=get_time),
    Field('user_email', default=get_user_email),
    Field('user_name'),
    Field('liked_by', type='list:string', default=[]),
)
# db.drawing.user_email.readable = db.drawing.user_email.writable = False 

db.define_table(
	'friend_code',
    Field('user_name', requires=IS_NOT_EMPTY()),
	Field('uuid', requires=IS_NOT_EMPTY()),
    Field('user_email', default=get_user_email),
    Field('following', type='list:string', default=[]),
)
db.friend_code.id.readable = db.friend_code.id.writable = False 
db.friend_code.user_email.readable = db.friend_code.user_email.writable = False 
db.friend_code.uuid.readable = db.friend_code.uuid.writable = False 
db.friend_code.following.readable = db.friend_code.following.writable = False 

db.commit()
