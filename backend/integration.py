from datetime import datetime

class FitnessIntegration:
    @staticmethod
    def sync_workout(user_id: str, calories: float, protein: float):
        """
        MOCK integration to a fitness platform (like Google Fit).
        In a real hackathon, this just logs payload to show functionality.
        """
        payload = {
            "platform": "FitnessMock Basic",
            "user_id": user_id,
            "metrics": {
                "calories_burned": 0, # Consumption, not burn, but API might differ
                "calories_consumed": calories,
                "protein_g": protein
            },
            "timestamp": datetime.now().isoformat()
        }
        
        # Simulate API Latency
        # time.sleep(0.5)
        
        print(f"\n[MOCK INTEGRATION] Sending data to Fitness Platform: {payload}\n")
        return {"status": "success", "synced_payload": payload}
