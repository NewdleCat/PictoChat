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
from py4web.utils.form import Form, FormStyleBulma

url_signer = URLSigner(session)

@action('index')
@action.uses(db, auth, 'index.html')
def index():
    user = get_user_email()
    print("User:", user)

    temp = db(db.friend_code.user_email == user).select()
    if len(temp) == 0:
        db.friend_code.insert(uuid=uuid.uuid4(), user_name=user)

    data = db(db.drawing.user_email == user).select().as_list()
    following = db(db.friend_code.user_email == user).select()[0]['following']
    print(following)

    if following != None:
        for f in following:
            temp = db(db.drawing.user_email == f).select().as_list()
            data = data + temp

    data = sorted(data, key=itemgetter('date_added'), reverse = True)

    owner = []
    likes = []
    for d in data:
        if d['user_email'] == user:
            owner.append(True)
        else:
            owner.append(False)
        likes.append(len(d['liked_by']))

    print(owner)
    print(likes)

    return dict(
        data = data,
        owner = owner,
        likes = likes,
        search_bar_url = URL('search_url', signer=url_signer),
        delete_post_url = URL('delete_image', signer=url_signer),
        post_url = URL('post', signer=url_signer),
        like_post_url = URL('like_post', signer=url_signer),
        profile_name = "",
    )

@action('editor')
@action.uses(db, session, auth, "editor.html")
def editor():
    return dict()

@action('add_friend/<friend_email>')
@action.uses(db, session, auth)
def add_friend(friend_email = None):
    assert friend_email is not None
    if friend_email == "":
        redirect(URL('index'))

    user = get_user_email()
    friend = db(db.friend_code.user_email == friend_email).select()
    you = db(db.friend_code.user_email == user).select()

    if len(friend) == 0:
        redirect(URL('index'))

    followingList = you[0]['following']
    if followingList == None:
        followingList = []
    if friend_email not in followingList:
        followingList.append(friend_email)
    if friend_email != user:
        db.friend_code.update_or_insert(db.friend_code.user_email == user, following = followingList)

    redirect(URL('index'))
    return dict()

#@action('post/<image_data>/<image_title>',method=["POST", "GET"])
#@action.uses(db, session, auth)
@action("post", method="POST")
@action.uses(url_signer.verify(), db)
def post():
    data = request.json.get("data")
    title = request.json.get("title")
    user = db(db.friend_code.user_email == get_user_email()).select()
    user = user[0].user_name
    print("YAAA: ",user)
    db.drawing.insert(title = title, image_data = data, user_name = user)
    #return dict()

@action('delete_image', method=["POST", "GET"])
@action.uses(db, session, auth.user)
def delete_image():
    image_id = request.json.get('id')
    assert image_id is not None
    db(db.drawing.id == image_id).delete()
    redirect(URL('index'))

@action('index/<username>', method=["POST", "GET"])
@action.uses(db, session, auth.user, "index.html")
def to_profile(username = None):
    assert username is not None
    user = get_user_email()
    data = db(db.drawing.user_name == username).select().as_list()
    data = sorted(data, key=itemgetter('date_added'), reverse = True)
    owner = []
    likes = []
    for d in data:
        if d['user_email'] == user:
            owner.append(True)
        else:
            owner.append(False)
        likes.append(len(d['liked_by']))
    return dict(
        data = data,
        owner = owner,
        likes = likes,
        search_bar_url = URL('search_url', signer=url_signer),
        delete_post_url = URL('delete_image', signer=url_signer),
        post_url = URL('post', signer=url_signer),
        like_post_url = URL('like_post', signer=url_signer),
        profile_name = username,
    )

@action('edit_username', method=["GET", "POST"])
@action.uses(db, session, auth.user, "edit_username.html")
def edit_username():
    user = db(db.friend_code.user_email == get_user_email()).select()
    user = user[0]
    if user is None:
        redirect(URL('index'))
    form = Form(db.friend_code, record=user, deletable=False, csrf_session=session, formstyle=FormStyleBulma)
    if form.accepted:
        updateDrawingUsernames(user)
        redirect(URL('index'))
    return dict(form = form)

@action('search_url', method=["GET"])
@action.uses(db, session, auth.user)
def search_url():
    entry = request.params.get('entry')
    assert entry is not None
    nameList = []
    posts = db(db.friend_code).select().as_list()
    for n in posts:
        name = n["user_name"]
        if name != None and (entry.lower() in name.lower()):
            nameList.append(name)
    return dict(nameList = nameList)

@action('like_post', method=["POST"])
@action.uses(db, session, auth.user)
def like_post():
    id = request.json.get('id')
    assert id is not None
    user = get_user_email()
    post = db(db.drawing.id == id).select().as_list()
    temp = post[0]["liked_by"].copy()
    if user in temp:
        temp.remove(user)
    else:
        temp.append(user)
    db.drawing.update_or_insert(db.drawing.id == id , liked_by=temp)
    print(temp)

    return dict(likes = len(temp))


     

def updateDrawingUsernames(user):
    username = user.user_name
    drawingsToUpdate = db(db.drawing.user_email == get_user_email()).select()
    print("NUM of DRAWINGS: ", len(drawingsToUpdate))
    for d in drawingsToUpdate:
        print("---USERNAME: ",d.user_name)
        db.drawing.update_or_insert((db.drawing.user_email==get_user_email()) & (db.drawing.date_added==d.date_added), user_name=username)

# @action('edit_profile', method=["POST", "GET"])
# @action.uses(db, session, auth.user)
# def edit_profile():
#     db(db.drawing.id == image_id).delete()
#     redirect(URL('index'))
