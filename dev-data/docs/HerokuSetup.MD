### Steps followed for setting up Heroku

* Login to Heroku
* Download the Heroku cli for the respective environment ( I used Win 64 version)
* Open a new command prompt and check heroku installation status: `heroku --version`
* Go to the application directory and create a Heroku app: `heroku create` 
The following was created for me:
The application URL: https://serene-dusk-43370.herokuapp.com/
The Heroku Github Repo: https://git.heroku.com/serene-dusk-43370.git
The remote created was : 'heroku' 
* If you check Git remote repositories now using `git remote -v` you should see `heroku` as an additional repo added.
* Now push all source code into the Heroku git repo via `git push heroku master`
(Note: the code needs to be pushed into the origin before this can happen!!)
* Scale the heroku app once using: `heroku ps:scale web=1`
* Open the Heroku application now : `heroku open`
* If the application doesnt open then check the logs for any application startup failure via `heroku logs`. Fix the issues, push the code back to remotes: origin and heroku to see the changes.

#### Additional steps: (optional)

Set the Heroku config setting for process environment varaibles using: `heroku config:set <key>=<value>`

