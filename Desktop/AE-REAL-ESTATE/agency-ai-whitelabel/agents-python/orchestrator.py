from crewai import Task, Crew, Process
from agents import AE6Agents

class RelaxModeOrchestrator:
    def __init__(self):
        self.agents = AE6Agents()
        
    def handle_command(self, user_input):
        # 1. Logic to determine which agent to use based on input
        # This is a simplified version of the orchestrator logic
        
        user_input_lower = user_input.lower()
        
        if any(word in user_input_lower for word in ["find", "scout", "search", "look for"]):
            return self.execute_scout_mission(user_input)
        elif any(word in user_input_lower for word in ["create", "write", "generate", "description"]):
            return self.execute_writer_mission(user_input)
        elif any(word in user_input_lower for word in ["post", "social", "facebook", "line", "share"]):
            return self.execute_social_mission(user_input)
        elif any(word in user_input_lower for word in ["schedule", "report", "viewing", "admin", "manage"]):
            return self.execute_admin_mission(user_input)
        else:
            return {
                "status": "confused",
                "message": "I'm not sure which agent should handle this. Try asking to 'find properties', 'create a listing', or 'schedule viewings'."
            }

    def execute_scout_mission(self, user_input):
        scout = self.agents.property_scout()
        task = Task(
            description=f"Analyze this request and find properties: {user_input}. Output should be a JSON list of 5-10 pre-vetted listings.",
            agent=scout,
            expected_output="A list of 5-10 property listings with price, location, and type."
        )
        crew = Crew(agents=[scout], tasks=[task], process=Process.sequential)
        result = crew.kickoff()
        return {"agent": "Property Scout", "result": result}

    def execute_writer_mission(self, user_input):
        writer = self.agents.listing_writer()
        task = Task(
            description=f"Create a luxury listing description based on: {user_input}. Include TH, EN, and ZH versions.",
            agent=writer,
            expected_output="A multi-lingual property description in TH, EN, and ZH."
        )
        crew = Crew(agents=[writer], tasks=[task], process=Process.sequential)
        result = crew.kickoff()
        return {"agent": "Listing Writer", "result": result}

    def execute_social_mission(self, user_input):
        social = self.agents.social_sync()
        task = Task(
            description=f"Plan social media activity for: {user_input}.",
            agent=social,
            expected_output="A social media posting schedule and sample engagement responses."
        )
        crew = Crew(agents=[social], tasks=[task], process=Process.sequential)
        result = crew.kickoff()
        return {"agent": "Social Sync", "result": result}

    def execute_admin_mission(self, user_input):
        admin = self.agents.admin_assistant()
        task = Task(
            description=f"Perform administrative tasks: {user_input}. Focus on qualification and scheduling.",
            agent=admin,
            expected_output="A report of scheduled viewings and qualified lead status."
        )
        crew = Crew(agents=[admin], tasks=[task], process=Process.sequential)
        result = crew.kickoff()
        return {"agent": "Admin Assistant", "result": result}
