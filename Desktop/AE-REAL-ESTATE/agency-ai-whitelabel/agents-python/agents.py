from crewai import Agent, Task, Crew, Process
from langchain_openai import ChatOpenAI
import os
from dotenv import load_dotenv

load_dotenv()

# Initialize LLM
# Using Mistral via Cloudflare or direct OpenAI
llm = ChatOpenAI(
    model="gpt-4o-mini",
    temperature=0.2
)

class AE6Agents:
    def property_scout(self):
        return Agent(
            role='Property Scout',
            goal='Scan social media and competitor sites for new luxury property listings in Thailand',
            backstory="""You are an expert real estate researcher. You have 24/7 access to 
            LINE VOOM, Facebook groups, and major real estate portals. You filter listings 
            based on strict luxury criteria (price, zone, type) and save the best ones.""",
            llm=llm,
            verbose=True,
            allow_delegation=False
        )

    def listing_writer(self):
        return Agent(
            role='Listing Writer',
            goal='Create compelling, multi-lingual (TH/EN/ZH) property descriptions',
            backstory="""You are a world-class copywriter specializing in luxury real estate. 
            You take raw data and transform it into emotional, high-converting narratives 
            tailored for high-net-worth individuals.""",
            llm=llm,
            verbose=True,
            allow_delegation=False
        )

    def social_sync(self):
        return Agent(
            role='Social Sync Manager',
            goal='Optimize social media presence and engagement',
            backstory="""You manage all social channels. You know the best times to post 
            and how to engage with potential leads. You ensure a consistent, premium 
            brand presence without human intervention.""",
            llm=llm,
            verbose=True,
            allow_delegation=False
        )

    def admin_assistant(self):
        return Agent(
            role='Admin Assistant',
            goal='Handle lead qualification and scheduling',
            backstory="""You are the backbone of the agency. You qualify leads, schedule 
            viewings, send follow-ups, and generate reports. You ensure the agent only 
            focuses on high-value meetings.""",
            llm=llm,
            verbose=True,
            allow_delegation=False
        )
