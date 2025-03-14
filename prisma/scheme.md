```mermaid
erDiagram

  "CustomEmoji" {
    String id "🗝️"
    String name 
    String aliases 
    String category "❓"
    String url 
    DateTime created_at 
    DateTime updated_at 
    }
  

  "User" {
    String id "🗝️"
    String sub 
    String name 
    String display_name "❓"
    DateTime created_at 
    DateTime updated_at 
    String avatar_url "❓"
    String bio "❓"
    String banner_url "❓"
    }
  

  "Folder" {
    String id "🗝️"
    String name 
    String author_id 
    DateTime created_at 
    }
  

  "File" {
    String id "🗝️"
    String filename 
    String mimetype 
    String url 
    String author_id 
    DateTime created_at 
    String meow_id "❓"
    }
  

  "Meow" {
    String id "🗝️"
    String text "❓"
    String author_id 
    DateTime created_at 
    String reply_id "❓"
    String remeow_id "❓"
    }
  

  "MeowReaction" {
    String id "🗝️"
    String meow_id 
    String user_id 
    String reaction 
    DateTime created_at 
    }
  

  "Favorite" {
    String id "🗝️"
    String meow_id 
    String user_id 
    DateTime created_at 
    }
  
    "CustomEmoji" o|--|o "File" : "File"
    "User" o{--}o "Meow" : "meows"
    "User" o{--}o "File" : "files"
    "User" o{--}o "Folder" : "folders"
    "User" o{--}o "User" : "following"
    "User" o{--}o "User" : "followers"
    "User" o{--}o "Favorite" : "favorites"
    "User" o{--}o "MeowReaction" : "MeowReaction"
    "Folder" o|--|| "User" : "author"
    "Folder" o{--}o "File" : "files"
    "Folder" o|--|o "Folder" : "parent"
    "Folder" o{--}o "Folder" : "children"
    "File" o|--|| "User" : "author"
    "File" o|--|o "Meow" : "meow"
    "File" o|--|o "Folder" : "folder"
    "File" o{--}o "CustomEmoji" : "CustomEmoji"
    "Meow" o|--|| "User" : "author"
    "Meow" o{--}o "File" : "attachments"
    "Meow" o|--|o "Meow" : "reply"
    "Meow" o|--|o "Meow" : "remeow"
    "Meow" o{--}o "Meow" : "replies"
    "Meow" o{--}o "Meow" : "remeows"
    "Meow" o{--}o "Favorite" : "favorites"
    "Meow" o{--}o "MeowReaction" : "MeowReaction"
    "MeowReaction" o|--|| "Meow" : "meow"
    "MeowReaction" o|--|| "User" : "user"
    "Favorite" o|--|| "Meow" : "meow"
    "Favorite" o|--|| "User" : "user"
```
