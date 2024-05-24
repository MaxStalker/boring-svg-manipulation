## Exposition

> _The exposition is **a set of scenes in a story that are meant to introduce the audience to the characters, world, and tone of the story**. It is relatively short, and no major changes occur during these opening scenes._

It was a nice calm evening, right after successfully lunched project. The feeling of accomplishment started to wither away and my mind started to wonder how to occupy itself. I heard a _bip_ and new email messages popped up in my inbox, notifying me that I just won 3rd place in Apparel Challenge on [www.kittl.com](http://www.kittl.com/). I jumped to check the result, then some of applicants who was close or got exact number of votes, then to the Pinterest and then back to Kittl.

I played around with leftover ideas for the past challenge, but haven’t posted anything. Then I got curios how Kittl is making money, so I looked around what is their business proposition, how they build a community, checked multiple videos they posted on [Youtube](https://www.youtube.com/@Kittldesign/videos) (lots of quality content there, highly recommend to check it out if you are interested), then researched what’s happening in POD (print on demand) domain, watched a bunch more videos from influencers, creators and debunkers to broaden the understanding of supply and demand…

At some point I got back to Kittle and stumbled into [Careers](https://www.kittl.com/career) page. There was an open position for **Senior Frontend Engineer (Rendering)** role with some more useful information about the team and their business. But on top of that there was this requirement that got most of my attention:

> **Domain Knowledge**: Vector graphics and SVG manipulation, with experience in rendering and displaying SVGs. Proficiency in Canvas 2D is a plus.

I skimmed the rest of the description, putting mental checkmarks against skills I had under my belt and got back to `Domain Knowledge`.

What would be the perfect demo to leave positive impression during interview if I would wanted to get this role? Now, this sound like something than can feed my curiosity and exploration itch for quite a while!

## TL;DR

If you wonder what this is all about and whether you should continue reading this, I’ll tell you.

This is an article about how you can compose expertise in different vaguely related fields into something new. It’s about self-doubt and perseverance. How one should start small, make even smallest steps, but still walking forward. How complex tasks can be chunked into smaller, more digestible pieces and then reassembled back. How everything is achievable if you put your fear and doubt on hold and carry on till the goal you set is reached.

Still with me? Good! Let’s go!

## The Stars Align

Nowadays I am a Lead Frontend Developer at [FindLabs](https://www.findlabs.io/), but I was trading my time for about 10 years as UI/UX designer designing interfaces for a wide range of different applications and domains. I had plenty hands on experience using vector based tools - CorelDraw, Illustrator, Photoshop (still my favorite one) and Figma - to design and prepare graphics for production (both print and on-screen).

As a matter of fact, I also explored SVG internals, capabilities and limitations and had bunch of experiments with SVG manipulation, when I was trying to switch my career from design into development field. [My Dribbble profile](https://dribbble.com/MaxStalker) still have some of them, alongside Canvas and CSS sandboxes.

I was in awe that SVG have native support for filters (blurs, shadows, complex color compositions, etc.), animation and even interactivity (albeit limited)!

And canvas felt almost natural and invoked heavy nostalgia from the first time I touched keyboard and wrote primitive program to draw a house out of lines utilizing Basic. Later on I had a chance to broaden my expertise, when I was doing my hobby game project with [Pixi](https://pixijs.com/) and small bits and pieces on FindLabs pages.

So, yeah. I wasn’t going blindly into the battlefield 😅

## What to build?

Kittle provides you with a set of tools to create impressive vector and bitmap based designs using only browser. Which makes it readily available and accessible for everyone with a computer and a mouse. No need to install “heavy” and expensive software. You can start creating right after you register!

One of the coolest features I’ve seen in Kittl - which is missing in, for example, Figma - is text styles and warping based on a curve. Like this:

![Align text to curve](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/18zbm86mcl7i22e095vq.png)

This is powerful and common effect, which allows you to create dynamic designs. I’d say it’s a “staple” one.

In order to implement something similar you will need to know:

- how SVG constructs vector image
- how coordinate system works in SVG
- how text can be represented in SVG format
- what are Bezier curves and how they are defined in SVG format
- how we can control individual points

How to build it? Check out [Chapter 1](./docs/chapter-1.md)