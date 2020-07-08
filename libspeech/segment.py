#!/usr/bin/python3

from deepsegment import DeepSegment

# The default language is 'en'
segmenter = DeepSegment("en")

result = segmenter.segment("I am Batman i live in gotham")
# ['I am Batman', 'i live in gotham']
print(result)

result = segmenter.segment("i get started with this example i want to talk about the sizes of each matrix because not every matrix can be multiplied by another matrix so let's take a look at the size of this first matrix in this first major we have one too rose and we have one two three columns so this first matrix is a two by three major too rose by three columns and if you take a look at the second major from multiply we have one two three rose and we have one two three columns so the second matrix is a three by three matrix")
print(result)

