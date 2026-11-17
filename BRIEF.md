# My Dashboard - Project Brief

## What is this?
This is a mobile web experience of a global retail company, (take Amazon as example), in which we want to integrate a new user flow of the delivery experience. When the user gets the package they get a text message confirming the delivery process (1.ordered confirmed, 2.payment confirmed, 3.out for delivery, 4.delivered). A new step will be added for the user to share their experience with the delivery and product status. They should get a link via text to access the web platform/native app and redirect them to a quick survey that has 3 main questions in a yes/no format and option to upload a picture if needed.

## Data
Generate a fake dataset as a JSON file (src/data/metrics.json).
Real time data from the delivery process and transporten status.
AI analysis of the user’s answers from survey. This will be used to make a quick review if the user agrees to.

## Layout (Vuetify)
- v-app-bar at the top of the screen for the user to navigate through the website. hamburger menu next to the logo on the left, avatar on the right.
- Title of the process + subtitle that indicates what the user will find in this flow
- Since it’ll be a feedback experience we’ll have a container mapped out with the questions as a title inside them.
	1. Please confirm you have received the package “Lorem ipsum...” 
	2. Did you get your product on the day it way expected?
    3. Was the product in good conditions?
    4.  Share your experience:- quick review of your answers- upload a picture of your product- quick preview of an AI summary of your answers, take as example the automated reviews from Amazon.
- Optional for the user: box text to add your personal review 
- All questions should have a yes/no button and a text container to add comments.


## Interactions
- each question will be replaced with the new one in a carrusel format with a easy in - easy out animation, slide style. It will have arrows to navigate through them and CTA to go “next” or “back” once you’re pass the first question, and a final CTA “share”.
- It’s a short flow experience, so no need to scroll it will all happen in a single screen as a quick visual interaction format the user can complete in less than 3 minutes.
- When the user click on “Share” they will be redirected to the text app message and receive a new one with a thank you message and a positive feedback with impact, example: “thank you, your experience review will help 867 people that are looking at your product right now!”


## Style
- light theme by default (vuetify light theme)
- Clean, minimal, lots of whitespace
- color palette should be whites, grays and purple.
- web responsive - feedback container expands if viewed in larger mobile screens/tablets/desktop


## Tech
- Vue 3 + TypeScript + Vuetify 3
- fake data from a local JSON file (no API calls)
- Single page - no routing for this app