#Switchback UI
Switchback UI (or SUI) is a UI library for Open RCT2

#Usage
To use SUI in your project, drop it in and let it rip bro.

#Documentation
There are two ways to use SUI, with methods (SwitchbackUI) or using JSX (SwitchbackJSX). They produce the same result, but you may find the JSX library to be easier to read.

##Concepts
SUI generates layouts based on a hierarchy of components: Groups and Widgets, under a Window. A Window can have many Groups and Widgets, and a Group can have many other Groups and Widgets.

Each parent component places each of its children in a sequence, one after another, in the direction of its "direction" attribute. Parent components can also have padding (constraints on how much space the children have in regards to the parent), and all components can have margins (constraints imposed by the child on how much to offset the size)
