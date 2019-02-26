# Vanilla bookmarks
This application allows the user to store his favorite bookmarks.
It is made by two main parts, the insertion form (which also works as update form) and the visualization.

The insertion form is a simple form prompting for the name and the url.
When the user submits an entry, this is saved in an indexedDB database and then the bookmarks list is rendered.
The indexedDB operations are event-driven and I used callbacks to connect the calls between the "front end back end" and the "front end front end".

Due to time constraints the way I coded the database won't scale efficiently.
Due to the same time constraints I opted for a minimal design recalling the style of the Developer Brief I received from you, hoping it can feel familiar.

Given more time I would have improved these interactions as well as the code structure.
I also would have opted for a more interactive interface with more animations and a better user interaction.

