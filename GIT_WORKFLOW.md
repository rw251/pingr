# PINGR Development Git Workflow

This document describes the software development workflow for PINGR, using Git and GitHub. It is based on the popular 'Feature Branch Workflow' strategy:

 * All feature development and bug fixes take place in a dedicated branch.  
 * Pull requests are then used to integrate new features back into the master branch.

This approach keeps the master branch free of code that might be broken or not yet ready for production, and it facilitates a collaborative approach to feature development.

## 1. Create a new feature branch

First make sure your working copy of the repository is on the latest version of the master branch:

```
git checkout master
git fetch origin
git reset --hard origin/master
```

Then create a branch for then new feature or bug fix:

```
git checkout -b feat/my-new-feature
```

When ready to push your commits to the central repository for the first time, do the following:

```
git push --set-upstream origin feat/my-new-feature
```

This will add the feature as a remote tracking branch. Subsequent pushes can be done simply by invoking `git push`


## 2. Submit a pull request

When you're happy the new feature is done, or if you want to invite other project developers to collaborate on the feature, then you should issue a pull request:

1. Visit the [project page on GitHub](https://github.com/rw251/pingr) and use the **branch** select box to switch to your feature branch.
2. Click the **New pull request** button. Confirm that the **base** and **compare** select boxes show *master* and your feature branch, respectively; change them if necessary.   
3. Enter an appropriate description for your pull request.
4. Click **Create pull request.**


## 3. Merge new feature & clean up

Once everyone is happy that the feature is complete and ready to go into the master branch, the pull request can be merged. Normally this will be done by the project owner.
 
If the feature addresses an active project issue on GitHub, then that issue should be closed. This can be done automatically by posting a special message referencing the issue to the pull request message thread; e.g. for a feature which addresses issue #5, posting:

```
closes #5
```

will ensure that issue #5 will be closed when the pull request is merged. 

Finally, the feature branch should be deleted, unless there is a specific need to preserve it.
