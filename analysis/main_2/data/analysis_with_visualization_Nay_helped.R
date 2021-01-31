library(tidyverse)
library(dplyr)
library(lme4)
library(languageR)
source("helpers.R")
theme_set(theme_bw())



setwd(dirname(rstudioapi::getActiveDocumentContext()$path))  
# trials contains the eye-tracking and time data
# BE CAREFUL! The participant number will go from 0 to 16 in each of trials 1 - 3. Need to change the 
# participant number before merging.
trials_1 <- read.csv("../data/example-trials_List1.csv", header = TRUE)
trials_2 <- read.csv("../data/example-trials_List2.csv", header = TRUE)
trials_3 <- read.csv("../data/example-trials_List3.csv", header = TRUE)

View(trials_1)

# screen_info contains the display dimensions. Needed for calculating Areas of Interest.
screen_info_1 <- read.csv("../data/example-system_List1.csv", header = TRUE)
screen_info_2 <- read.csv("../data/example-system_List2.csv", header = TRUE)
screen_info_3 <- read.csv("../data/example-system_List3.csv", header = TRUE)

# need to get participant info in order to capture their accuracy ratings
participant_info_1 <- read.csv("../data/example-subject_information_List1.csv", header = TRUE)
participant_info_2 <- read.csv("../data/example-subject_information_List2.csv", header = TRUE)
participant_info_3 <- read.csv("../data/example-subject_information_List3.csv", header = TRUE)

# merge trial information with their related system-info. 
df_1 <- merge(trials_1, screen_info_1, by.x="workerid", by.y="workerid")
df_2 <- merge(trials_2, screen_info_2, by.x="workerid", by.y="workerid")
df_3 <- merge(trials_3, screen_info_3, by.x="workerid", by.y="workerid")

# merge again to get participant information, including accuracy ratings
df_1 <- merge(df_1, participant_info_1, by.x="workerid", by.y="workerid")
df_2 <- merge(df_2, participant_info_2, by.x="workerid", by.y="workerid")
df_3 <- merge(df_3, participant_info_3, by.x="workerid", by.y="workerid")

View(df_3)
names(df_3)
smaller <- df_3 %>% select(workerid, ExpFiller, location1, location2, location3, location4, location5, location6, 
                           location7, location8, location9, location10, correctAns1, correctAns2, competitor1, 
                           competitor2, target1, target2, target_object3, target_figure3, target1, target2, instruction3)
View(smaller)
smaller <- smaller %>% filter(ExpFiller == "Exp") 
View(smaller)

# now we need to change the workerid so that the three lists don't just overwrite each other
df_2$workerid <- df_2$workerid + 17
df_3$workerid <- df_3$workerid + 34

# merge into a master list
df = rbind(df_1, df_2, df_3)
View(df)
smaller <- df %>% select(workerid, language)
View(smaller)
smaller <- group_by(df, workerid, language)
View(summarise(smaller))

#clean up the time, x, and y strings
df$time <- gsub("\\[", "", df$time)
df$time <- gsub("\\]", "", df$time)
df$x <- gsub("\\[", "", df$x)
df$x <- gsub("\\]", "", df$x)
df$y <- gsub("\\[", "", df$y)
df$y <- gsub("\\]", "", df$y)

View(df)
names(df)
View(df%>% select(slide_number, ExpFiller, target1, target2, competitor1, competitor2, Prime, location1, location2, location3, location4, location5, location6, location7, location8, location9, location10))

# pick out the first time stamp per trial and keep as reference. 
# DO NOT RE-RUN. Only run once.
df$first_time <- parse_number(df$time)

# this separates the data for one gaze location and time stamp per row.
# DO NOT RUN THIS until you're sure the data is formatted. It's going to get huge after this. 
df <- df %>%
  transform(time = strsplit(time, ","), x = strsplit(x, ","), y = strsplit(y, ",")) %>%
  unnest(c(time, x, y))


#convert string or character values to numerics
df$x <- as.numeric(df$x)
df$y <- as.numeric(df$y)
df$time <- as.numeric(df$time)


selected <- df %>% select(workerid, first_time, time, x, y)
View(selected)


# EYE GAZE COORDINATE ASSIGNMENTS
# ZONE 1 = LOWER LEFT SECTOR
# ZONE 2 = UPPER LEFT SECTOR
# ZONE 3 = UPPER RIGHT SECTOR
# ZONE 4 = LOWER RIGHT SECTOR
# ZONE 5 = CENTER (RESIDUE SET)

# assign a zone label given x and y coordinates, use this for troubleshooting only
df$gaze_zone_1 <- if_else((df$x <= (df$windowW/3)) & (df$x >= 0) & (df$y <= (df$windowH/3)) & (df$y >= 0), 1, 0)
df$gaze_zone_2 <- if_else((df$x <= (df$windowW/3)) & (df$x >= 0) & (df$y >= ((2*df$windowH)/3)) & (df$y <= df$windowH), 2, 0)
df$gaze_zone_3 <- if_else((df$x >= ((2*df$windowW)/3)) & (df$x <= df$windowW) & (df$y >= ((2*df$windowH)/3)) & (df$y <= df$windowH), 3, 0)
df$gaze_zone_4 <- if_else((df$x >= ((2*df$windowW)/3)) & (df$x <= df$windowW) & (df$y <= (df$windowH/3)) & (df$y >= 0), 4, 0) 
df$gaze_zone_5 <- if_else((df$x >= (df$windowW/3)) & (df$x <= ((2*df$windowW)/3)) & (df$y >= (df$windowH/3)) & (df$y <= ((2*df$windowH)/3)), 5, 0)                                        

# same thing, all at once. Use the above for troubleshooting.                                                  
df$gaze_zone <- if_else((df$x <= (df$windowW/3)) & (df$x >= 0) & (df$y <= (df$windowH/3)) & (df$y >= 0), 1,
                if_else((df$x <= (df$windowW/3)) & (df$x >= 0) & (df$y >= ((2*df$windowH)/3)) & (df$y <= df$windowH), 2, 
                if_else((df$x >= ((2*df$windowW)/3)) & (df$x <= df$windowW) & (df$y >= ((2*df$windowH)/3)) & (df$y <= df$windowH), 3,
                if_else((df$x >= ((2*df$windowW)/3)) & (df$x <= df$windowW) & (df$y <= (df$windowH/3)) & (df$y >= 0), 4,  
                if_else((df$x >= (df$windowW/3)) & (df$x <= ((2*df$windowW)/3)) & (df$y >= (df$windowH/3)) & (df$y <= ((2*df$windowH)/3)), 5, 0)))))                                        


selected <- df %>% select(workerid, first_time, time, x, y, gaze_zone)
View(selected)
View(df)

smaller = df %>%
  select(x, y, gaze_zone)
View(smaller)

#compare the eye gaze zone to the locations of target, competitor, and residue sets.
# create extra columns that show 1 (yes) or 0 (no) for looks to target, competitor, and residue

df$looks_to_target <- if_else(df$gaze_zone == 1 & df$target1 == 2, 1,
                      if_else(df$gaze_zone == 2 & df$target1 == 1, 1, 
                      if_else(df$gaze_zone == 3 & df$target1 == 3, 1,
                      if_else(df$gaze_zone == 4 & df$target1 == 4, 1, 0))))

#df$looks_to_target <- if_else(df$gaze_zone == 1 & (df$correctAns1 == "AOI2" | df$correctAns2 == "AOI8"), 1, 
#                      if_else(df$gaze_zone == 2 & (df$correctAns1 == "AOI1" | df$correctAns2 == "AOI7"), 1, 
#                      if_else(df$gaze_zone == 3 & (df$correctAns1 == "AOI3" | df$correctAns2 == "AOI9"), 1,
#                      if_else(df$gaze_zone == 4 & (df$correctAns1 == "AOI4" | df$correctAns2 == "AOI10"), 1, 0))))

df$looks_to_competitor <- if_else(df$gaze_zone == 1 & df$competitor1 == 2, 1,
                          if_else(df$gaze_zone == 2 & df$competitor1 == 1, 1, 
                          if_else(df$gaze_zone == 3 & df$competitor1 == 3, 1, 
                          if_else(df$gaze_zone == 4 & df$competitor1 == 4, 1, 0))))
                                             
df$look_to_residue <- if_else(df$gaze_zone == 5, 1, 0)


#divide the time stream. Create a column labeling the time interval after onset as 
# "baseline," "gender," "determiner," "name," "noun" 

df$time_after_onset <- df$time - df$first_time

df$interval <-  if_else(df$time_after_onset >= 1000 & df$time_after_onset <= 1731, "Baseline", 
                if_else(df$time_after_onset <= 2702, "Gender", 
                if_else(df$time_after_onset <= 3410, "Determiner", 
                if_else(df$time_after_onset <= 3960, "Name",
                if_else(df$time_after_onset > 3960, "Noun", "error")))))

View(df)

s <- df %>% filter(x > windowW & y > windowH)
nrow(s)

myData %>% group_by(MainEntry) %>% filter(Counts > 0) %>% summarise(counted = n())

#DATA VISUALIZATION BELOW#

# Looks to target prep

plot_target_look <- df %>% 
  filter(ExpFiller == "Exp", time_after_onset < 4700, (looks_to_target == 1 | looks_to_competitor == 1)) %>%    #there's a long tail, there are a few trials in which participants continued looking long after the audio ended.
  group_by(workerid, displayID) %>%
  mutate(                                                    #Nay's clever way of bucketing time intervals
    time_bin = floor(time / 50),
    time_bin = (time_bin - min(time_bin)) * 50
  ) %>%
  group_by(condition, interval, time_bin, size) %>%
  summarise(
    mean_look_to_target = mean(looks_to_target) # maybe keep mean of measure 
  ) 
View(df)

# Plot for looks to target

plot_target_look %>% 
  ggplot(aes(x = time_bin, y = mean_look_to_target, color = condition, linetype = size, fill = condition)) +
  geom_smooth(method = "loess") +
  geom_vline(xintercept = 1731) +
  geom_vline(xintercept = 2702) +
  geom_vline(xintercept = 3410) +
  geom_vline(xintercept = 3960) +
  annotate("text", x = 850, y = 0.15, label = "Baseline") +
  annotate("text", x = 2200, y = 0.15, label = "Gender") +
  annotate("text", x = 3050, y = 0.15, label = "Determiner") +
  annotate("text", x = 3675, y = 0.15, label = "Name") +
  annotate("text", x = 4500, y = 0.15, label = "Noun")

#look to competitor prep

plot_comp_look <- df %>% 
  filter(ExpFiller == "Exp", time_after_onset < 4700, (looks_to_target == 1 | looks_to_competitor == 1)) %>%    #there's a long tail, there are a few trials in which participants continued looking long after the audio ended.
  group_by(workerid, displayID) %>%
  mutate(                                                    #Nay's clever way of bucketing time intervals
    time_bin = floor(time / 50),
    time_bin = (time_bin - min(time_bin)) * 50
  ) %>%

  group_by(condition, interval, time_bin) %>%
  summarise(
    mean_look_to_competitor = mean(looks_to_competitor) # maybe keep mean of measure 
  ) 

#looks to comp graph
plot_comp_look %>% 
  ggplot(aes(x = time_bin, y = mean_look_to_competitor, color = condition, fill = condition)) +
  geom_smooth(method = "loess") +
  geom_vline(xintercept = 1731) +
  geom_vline(xintercept = 2702) +
  geom_vline(xintercept = 3410) +
  geom_vline(xintercept = 3960) +
  annotate("text", x = 850, y = 0.15, label = "Baseline") +
  annotate("text", x = 2200, y = 0.15, label = "Gender") +
  annotate("text", x = 3050, y = 0.15, label = "Determiner") +
  annotate("text", x = 3675, y = 0.15, label = "Name") +
  annotate("text", x = 4500, y = 0.15, label = "Noun")

# look to competitor with size 
plot_comp_look <- df %>% 
  filter(ExpFiller == "Exp", time_after_onset < 4700, (looks_to_target == 1 | looks_to_competitor == 1)) %>%    #there's a long tail, there are a few trials in which participants continued looking long after the audio ended.
  group_by(workerid, displayID) %>%
  mutate(                                                    #Nay's clever way of bucketing time intervals
    time_bin = floor(time / 50),
    time_bin = (time_bin - min(time_bin)) * 50
  ) %>%
  group_by(condition, interval, time_bin, size) %>%
  summarise(
    mean_look_to_competitor = mean(looks_to_competitor) # maybe keep mean of measure 
  ) 

# tried summarise(log_looks_to_target = log(mean(looks_to_target)/mean(looks_to_competitor)))
# didn't work. 

#looks to comp graph with size
plot_comp_look %>% 
  ggplot(aes(x = time_bin, y = mean_look_to_competitor, color = condition, linetype = size, fill = condition)) +
  # geom_line() +
  geom_smooth(method = "loess") +
  geom_vline(xintercept = 1731) +
  geom_vline(xintercept = 2702) +
  geom_vline(xintercept = 3410) +
  geom_vline(xintercept = 3960) +
  annotate("text", x = 850, y = 0.15, label = "Baseline") +
  annotate("text", x = 2200, y = 0.15, label = "Gender") +
  annotate("text", x = 3050, y = 0.15, label = "Determiner") +
  annotate("text", x = 3675, y = 0.15, label = "Name") +
  annotate("text", x = 4500, y = 0.15, label = "Noun")

# Prepare residue graph

plot_residue_look <- df %>%
  filter(ExpFiller == "Exp", time_after_onset < 4700) %>%    
  group_by(workerid, displayID) %>%
  mutate(                                                    #Nay's clever way of bucketing time intervals
    time_bin = floor(time / 50),
    time_bin = (time_bin - min(time_bin)) * 50
  ) %>%
  group_by(workerid, condition, displayID, interval, time_bin) %>%
  summarise(
    mean_look_to_residue = mean(look_to_residue) 
  ) %>%
  group_by(condition, interval, time_bin) %>%
  summarise(
    mean_look_to_residue = mean(mean_look_to_residue)  
  ) 

       
# Residue Plot
     
plot_residue_look %>% 
  ggplot(aes(x = time_bin, y = mean_look_to_residue, color = condition, fill = condition)) +
  geom_smooth(method = "loess") +
  geom_vline(xintercept = 1731) +
  geom_vline(xintercept = 2702) +
  geom_vline(xintercept = 3410) +
  geom_vline(xintercept = 3960) +
  annotate("text", x = 850, y = 0.15, label = "Baseline") +
  annotate("text", x = 2200, y = 0.15, label = "Gender") +
  annotate("text", x = 3050, y = 0.15, label = "Determiner") +
  annotate("text", x = 3675, y = 0.15, label = "Name") +
  annotate("text", x = 4500, y = 0.15, label = "Noun")


#STATS
table(df$looks_to_target)
prop.table(table(df$looks_to_target))

m.norandom = glm(looks_to_target ~ 1, data=df, family="binomial")
summary(m.norandom)

logit2prop <- function(l) {
  exp(l)/(1+exp(l))
}

logit2prop(-2.630200)                   
plogis(-2.630200)

table(df$condition, df$looks_to_target)

# Target preference by determiner type

target_competitor_only <- df %>% 
  filter(ExpFiller == "Exp", time_after_onset < 4700, 
            (looks_to_target == 1 | looks_to_competitor == 1), 
            language != "Bulgarian", 
            language != "polish"
         )

names(target_competitor_only)

m = glmer(looks_to_target ~ condition + (1|displayID), data=target_competitor_only, family="binomial")
  summary(m)

centered = cbind(target_competitor_only,myCenter(target_competitor_only[,c("looks_to_target")]))
head(centered)
summary(centered)

m.c = glmer(looks_to_target ~ condition + (1|displayID), data=centered, family="binomial")
summary(m.c)


# Target preference by size
m = glmer(looks_to_target ~ size + (1|displayID), data=target_competitor_only, family="binomial")
summary(m)

centered = cbind(target_competitor_only,myCenter(target_competitor_only[,c("looks_to_target")]))

m.c = glmer(looks_to_target ~ size + (1|displayID), data=centered, family="binomial")
summary(m.c)


# Target preference by time
m.c = glmer(looks_to_target ~ interval + (1|displayID), data=centered, family="binomial")
summary(m.c)

# Looks to residue by condition

residue_only <- df %>% 
  filter(ExpFiller == "Exp", time_after_onset < 4700, 
         (looks_to_target != 1 & looks_to_competitor != 1), 
         language != "Bulgarian", 
         language != "polish"
  )

m = glmer(look_to_residue ~ condition + (1|displayID), data=residue_only, family="binomial")
summary(m)

centered = cbind(residue_only,myCenter(residue_only[,c("look_to_residue")]))
head(centered)
summary(centered)

m.c = glmer(look_to_residue ~ condition + (1|displayID), data=centered, family="binomial")

summary(m.c)

# Looks to residue by size
m.c = glmer(look_to_residue ~ size + (1|displayID), data=centered, family="binomial")
summary(m.c)

# Looks to residue by time
m.c = glmer(look_to_residue ~ interval + (1|displayID), data=centered, family="binomial")
summary(m.c)



         

