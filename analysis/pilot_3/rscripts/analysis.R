library(tidyverse)
source("helpers.R")
theme_set(theme_bw())

setwd(dirname(rstudioapi::getActiveDocumentContext()$path))    
df = read.csv("../data/example-trials.csv", header = TRUE)
View(df)

