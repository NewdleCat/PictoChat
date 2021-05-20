"""
This file defines actions, i.e. functions the URLs are mapped into
The @action(path) decorator exposed the function at URL:

    http://127.0.0.1:8000/{app_name}/{path}

If app_name == '_default' then simply

    http://127.0.0.1:8000/{path}

If path == 'index' it can be omitted:

    http://127.0.0.1:8000/

The path follows the bottlepy syntax.

@action.uses('generic.html')  indicates that the action uses the generic.html template
@action.uses(session)         indicates that the action uses the session
@action.uses(db)              indicates that the action uses the db
@action.uses(T)               indicates that the action uses the i18n & pluralization
@action.uses(auth.user)       indicates that the action requires a logged in user
@action.uses(auth)            indicates that the action requires the auth object

session, db, T, auth, and tempates are examples of Fixtures.
Warning: Fixtures MUST be declared with @action.uses({fixtures}) else your app will result in undefined behavior
"""

from py4web import action, request, abort, redirect, URL
from yatl.helpers import A
from .common import db, session, T, cache, auth, logger, authenticated, unauthenticated, flash
from py4web.utils.url_signer import URLSigner
from .models import get_user_email
import uuid
from operator import itemgetter 
url_signer = URLSigner(session)

@action('index')
@action.uses(db, auth, 'index.html')
def index():
    user = get_user_email()
    print("User:", user)

    temp = db(db.friend_code.user_email == user).select()
    if len(temp) == 0:
        db.friend_code.insert(uuid=uuid.uuid4())

    data = db(db.drawing.user_email == user).select().as_list()
    following = db(db.friend_code.user_email == user).select()[0]['following']
    print(following)

    if following != None:
        for f in following:
            temp = db(db.drawing.user_email == f).select().as_list()
            data = data + temp

    data = sorted(data, key=itemgetter('date_added'), reverse = True)

    owner = []
    for d in data:
        if d['user_email'] == user:
            owner.append(True)
        else:
            owner.append(False)

    print(owner)

    return dict(data = data, owner = owner)

@action('editor')
@action.uses(db, session, auth, "editor.html")
def editor():
    return dict()

@action('add_friend/<uuid>')
@action.uses(db, session, auth)
def add_friend(uuid = None):
    assert uuid is not None
    if uuid == "":
        redirect(URL('index'))

    user = get_user_email()
    print("YAA")
    friend = db(db.friend_code.uuid == uuid).select()
    you = db(db.friend_code.user_email == user).select()
    if len(friend) == 0:
        redirect(URL('index'))

    followingList = you[0]['following']
    friendName = friend[0]['user_email'] 
    if followingList == None:
        followingList = []
    if friendName not in followingList:
        followingList.append(friendName)
    if friendName != user:
        db.friend_code.update_or_insert(db.friend_code.user_email == user, following = followingList)

    redirect(URL('index'))
    return dict()

@action('post/<image_data>',method=["POST", "GET"])
@action.uses(db, session, auth)
def post(image_data = None):
    assert image_data is not None
    print(image_data)
    db.drawing.insert(title = "temporary title", image_data = image_data)
    redirect(URL('index'))
    return dict()

@action('delete_image/<image_id>', method=["POST", "GET"])
@action.uses(db, session, auth.user)
def delete_image(image_id = None):
    assert image_id is not None
    db(db.drawing.id == image_id).delete()
    redirect(URL('index'))

@action('edit_profile', method=["POST", "GET"])
@action.uses(db, session, auth.user)
def edit_profile():
    db(db.drawing.id == image_id).delete()
    redirect(URL('index'))