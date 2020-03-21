# firebase function deployment steps

```
$ firebase login --no-localhost

$ firebase projects:list

$ firebase use --project MyDialogflow_ProjectID

$ firebase use --add
? Which project do you want to add? MyDialogflow_ProjectID
? What alias do you want to use for this project? (e.g. staging) MyDialogflow

Created alias MyDialogflow for MyDialogflow_ProjectID.
Now using alias MyDialogflow (MyDialogflow_ProjectID)

$ (cd functions; npm install)

$ firebase deploy
```