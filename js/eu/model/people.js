define(function() {

    var Advisor = function Advisor(advisor) {
        // Advisor name
        this.name = advisor.name;
        // fortification_expert, etc
        this.type = advisor.type;
        // Skill: Integer
        this.skill = advisor.skill;
        // Location: Province id
        this.location = advisor.location;
        // A date
        this.date = advisor.date;
        // Optionnal hire date
        this.hire_date = advisor.hire_date || null;
        // Optionnal death date
        this.death_date = advisor.death_date || null;
    };

    Advisor.types = {
        // TODO
    };

    var MilitaryLeader = function MilitaryLeader(leader) {
        this.name = leader.name;

        if(!(leader.type in MilitaryLeader.types)) {
            throw "Invalid MilitaryLeader type: "+leader.type;
        }
        this.type = leader.type;

        // Optionnal activation date
        this.activation = leader.activation;

        // Optionnal death date
        this.death_date = leader.death_date || null;

        this.skills = {
            maneuver: leader.skills["maneuver"],
            fire: leader.skills["fire"],
            shock: leader.skills["shock"],
            siege: leader.skills["siege"]
        }
    }

    MilitaryLeader.types = {
        general: "land",
        admiral: "sea",
        conquistador: "land",
        explorer: "sea"
    };

    var Leader = function Leader(leader) {
        if(leader.type !== "monarch" && leader.type !== "heir") {
            throw "Invalid leader type: "+leader.type;
        }
        this.type = leader.type;

        // Monarch and heir common attributes
        this.name = leader.name;
        // A MilitaryLeader instance
        this.leader = leader.leader || null;
        // Monarch skills (or future monarch for heir)
        this.skills = {
            dip: leader.skills["dip"],
            adm: leader.skills["adm"],
            mil: leader.skills["mil"]
        };

        // Non republican leaders
        // Optionnal leader dynasty
        this.dynasty = leader.dynasty || null;
        // Optionnal birth date
        this.birth_date = leader.birth_date || null;

        // Heir only attributes
        if(leader.type === "heir") {
            // A boolean
            this.succeeded = leader.succeeded;
            // Optionnal death date
            this.death_date = leader.death_date || null;
            // Futur monarch name
            this.monarch_name = leader.monarch_name;
            // An integer
            this.claim = leader.claim;
        }
    };

    return {
        MilitaryLeader: MilitaryLeader,
        Leader: Leader,
        Advisor: Advisor
    }
});
