refactor the approach. this time i want to do the following:

output an indepth prd document, implementation document that outlines the full requirements i mention below, and how we will implement it (2 separate files):

- create a next.js app with a simple ui using shadcn
allow me to upload groups of screenshots at a time
for each screenshot, send it to a claude llm which will: identify if we are looking at a screenshot containing a.spotify or youtube video transcript, extract the title of video, extract the current timestamp
store these all back in a centralised location, E.g. some storage technique that allows me to concatenate each screenshot as it gets added. E.g. we might have 5 screenshots of different timestamps of the same video.
give me an output object that has all video/podcast titles, paired with all tmestamps from it.
2nd part of flow (from the nextjs backend OR frontend. you consider what is best practice): create an automation which uses puppeteer. it will open a new browser, navigate to sptoify web app, login using hardcoded credentials defined in .env
for each podcast heading, pupeeter goes to the search bar, searches the heading, finds the top result, hits play, jumps/pans the playback bar to the respective timestamp
then, (i'm assuming this will all be client side, but maybe backend can achieve this?) i want to record the screen. hit record at the same time the puppeteer script navigates to each timestamp and record 1 minute prior to the timestamp, till 1 minute after (i'm trying to get a transcript of what happened at that moment in time. i took a screenshot there because i want to extract the transcript. that's the whole point of script).
for each timestamp in each video/podcast, record the screen and store the transcript. store them all back in a local directory.
once all recordings done, send them to parakeet software to convert from audio to text. return me the text.
output all text in nicely formatted individual text output files in markdown format PER video title.