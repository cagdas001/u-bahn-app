import React, { useState, useEffect, useCallback } from "react";
import PT from "prop-types";
import Button from "../Button";
import WideButton from "../wideButton";
import Collapsible from "../collapsible";
import Availability from "../availability";
import EditFiltersPopup from "../editFiltersPopup";
import SuggestionBox from "../SuggestionBox";
import Pill from "../Pill";

import { useSearch, FILTERS } from "../../lib/search";
import { useModal } from "../../lib/modal";

import styles from "./filters.module.css";
import utilityStyles from "../../styles/utility.module.css";

/**
 * SearchTabFilters - component containing all the filters on the search tab page
 * achievements: the values for the achievements filter options
 */
export default function SearchTabFilters() {
  const search = useSearch();

  /**
   * Component unmount trigger
   */
  useEffect(() => {
    return () => {
      handleReset();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleReset = () => {
    search.selectLocations([]);
    search.selectSkills([]);
    search.selectAchievements([]);
    search.selectAvailability({
      isAvailableSelected: false,
      isUnavailableSelected: false,
    });
    search.selectCompanyAttributes({});
    search.changePageNumber(1);
  };

  const [numberOfFiltersApplied, setNumberOfFiltersApplied] = useState();
  const modal = useModal();

  const handlePopupCancel = () => {
    modal.hideModal();
  };

  const handlePopupDone = (filtersSelected) => {
    modal.hideModal();
    search.deactivateAllFilters();
    filtersSelected.forEach((id) => {
      search.activateFilter(id);
    });

    setNumberOfFiltersApplied(getAppliedFilters());
  };

  const getAppliedFilters = useCallback(() => {
    let appliedFilters = 0;
    if (search.isFilterActive(FILTERS.LOCATIONS)) {
      if (search.selectedLocations.length > 0) {
        appliedFilters += 1;
      }
    }

    if (search.isFilterActive(FILTERS.SKILLS)) {
      if (search.selectedSkills.length > 0) {
        appliedFilters += 1;
      }
    }

    if (search.isFilterActive(FILTERS.ACHIEVEMENTS)) {
      if (search.selectedAchievements.length > 0) {
        appliedFilters += 1;
      }
    }

    if (search.isFilterActive(FILTERS.AVAILABILITY)) {
      if (
        search.selectedAvailability.isAvailableSelected ||
        search.selectedAvailability.isUnavailableSelected
      ) {
        appliedFilters += 1;
      }
    }

    search.getCompanyAttrActiveFilter().forEach((filter) => {
      if (
        search.selectedCompanyAttributes[filter.id] &&
        search.selectedCompanyAttributes[filter.id].length > 0
      ) {
        appliedFilters += 1;
      }
    });

    return appliedFilters;
  }, [search]);

  useEffect(() => {
    setNumberOfFiltersApplied(getAppliedFilters());
  }, [getAppliedFilters]);

  const handleAddFilter = () => {
    if (modal.isModalOpen) {
      modal.hideModal();
    } else {
      modal.showModal();
    }
  };

  const addLocationToFilter = (location) => {
    const locationFilters = JSON.parse(
      JSON.stringify(search.selectedLocations)
    );

    if (locationFilters.findIndex((s) => s.id === location.id) !== -1) {
      return;
    }
    locationFilters.push({ name: location.value, id: location.id });
    search["selectLocations"](locationFilters);
  };

  const removeLocationFromFilter = (location) => {
    const locationFilters = JSON.parse(
      JSON.stringify(search.selectedLocations)
    );
    const index = locationFilters.findIndex((s) => s.id === location.id);

    if (index === -1) {
      return;
    }

    locationFilters.splice(index, 1);
    search["selectLocations"](locationFilters);
  };

  const addSkillToFilter = (skill) => {
    const skillFilters = JSON.parse(JSON.stringify(search.selectedSkills));

    if (
      skillFilters.findIndex(
        (s) =>
          s.skillProviderId === skill.skillProviderId &&
          s.skillId === skill.skillId
      ) !== -1
    ) {
      return;
    }

    skillFilters.push(skill);
    search["selectSkills"](skillFilters);
  };

  const removeSkillFromFilter = (skill) => {
    const skillFilters = JSON.parse(JSON.stringify(search.selectedSkills));
    const index = skillFilters.findIndex(
      (s) =>
        s.skillProviderId === skill.skillProviderId &&
        s.skillId === skill.skillId
    );

    if (index === -1) {
      return;
    }

    skillFilters.splice(index, 1);
    search["selectSkills"](skillFilters);
  };

  const addAchievementToFilter = (achievement) => {
    const achievementFilters = JSON.parse(
      JSON.stringify(search.selectedAchievements)
    );

    if (achievementFilters.findIndex((s) => s.id === achievement.id) !== -1) {
      return;
    }
    achievementFilters.push(achievement);
    search["selectAchievements"](achievementFilters);
  };

  const removeAchievementFromFilter = (achievement) => {
    const achievementFilters = JSON.parse(
      JSON.stringify(search.selectedAchievements)
    );
    const index = achievementFilters.findIndex((s) => s.id === achievement.id);

    if (index === -1) {
      return;
    }

    achievementFilters.splice(index, 1);
    search["selectAchievements"](achievementFilters);
  };

  const addCompanyAttributeToFilter = (attrId, data) => {
    const companyAttrFilters = JSON.parse(
      JSON.stringify(search.selectedCompanyAttributes)
    );

    if (attrId in companyAttrFilters) {
      if (
        companyAttrFilters[attrId].findIndex((s) => s.id === data.id) !== -1
      ) {
        return;
      }
    } else {
      companyAttrFilters[attrId] = [];
    }

    companyAttrFilters[attrId].push(data);
    search["selectCompanyAttributes"](companyAttrFilters);
  };

  const removeCompanyAttributeFromFilter = (attrId, data) => {
    const companyAttrFilters = JSON.parse(
      JSON.stringify(search.selectedCompanyAttributes)
    );
    const index = companyAttrFilters[attrId].findIndex((s) => s.id === data.id);

    if (index === -1) {
      return;
    }

    companyAttrFilters[attrId].splice(index, 1);
    search["selectCompanyAttributes"](companyAttrFilters);
  };

  const companyAttrFiltersComponent = search
    .getCompanyAttrActiveFilter()
    .map((filter) => (
      <div className={utilityStyles.mt32} key={filter.id}>
        <Collapsible title={filter.text}>
          <SuggestionBox
            placeholder="Search values to filter with"
            purpose="companyAttributes"
            companyAttrId={filter.id}
            onSelect={addCompanyAttributeToFilter}
          />
          {filter.id in search.selectedCompanyAttributes &&
            search.selectedCompanyAttributes[filter.id].length > 0 && (
              <div className={utilityStyles.mt16}>
                {search.selectedCompanyAttributes[filter.id].map((data) => {
                  return (
                    <Pill
                      key={data.id}
                      name={data.value}
                      removable={true}
                      onRemove={() =>
                        removeCompanyAttributeFromFilter(filter.id, data)
                      }
                    />
                  );
                })}
              </div>
            )}
        </Collapsible>
      </div>
    ));

  return (
    <div className={styles.searchTabFilters}>
      <Summary
        filtersApplied={numberOfFiltersApplied}
        handleReset={handleReset}
      />
      {search.isFilterActive(FILTERS.LOCATIONS) && (
        <div className={utilityStyles.mt32}>
          <Collapsible title="Location">
            <SuggestionBox
              placeholder={"Search for a location"}
              onSelect={addLocationToFilter}
              purpose="locations"
              companyAttrId={search.getAttributeId(FILTERS.LOCATIONS)}
            />
            {search.selectedLocations.length > 0 && (
              <div className={utilityStyles.mt16}>
                {search.selectedLocations.map((location) => {
                  return (
                    <Pill
                      key={location.id}
                      name={location.name}
                      removable={true}
                      onRemove={() => removeLocationFromFilter(location)}
                    />
                  );
                })}
              </div>
            )}
          </Collapsible>
        </div>
      )}
      {search.isFilterActive(FILTERS.AVAILABILITY) && (
        <div className={utilityStyles.mt32}>
          <Collapsible title="Availability">
            <Availability
              availableSelected={
                search.selectedAvailability.isAvailableSelected
              }
              unavailableSelected={
                search.selectedAvailability.isUnavailableSelected
              }
              selector={"selectAvailability"}
            />
          </Collapsible>
        </div>
      )}
      {search.isFilterActive(FILTERS.SKILLS) && (
        <div className={utilityStyles.mt32}>
          <Collapsible title="Skills">
            <SuggestionBox
              placeholder={"Search skill to filter with"}
              onSelect={addSkillToFilter}
              purpose="skills"
            />
            {search.selectedSkills.length > 0 && (
              <div className={utilityStyles.mt16}>
                {search.selectedSkills.map((skill) => {
                  return (
                    <Pill
                      key={skill.id}
                      name={skill.name}
                      removable={true}
                      onRemove={() => removeSkillFromFilter(skill)}
                    />
                  );
                })}
              </div>
            )}
          </Collapsible>
        </div>
      )}
      {search.isFilterActive(FILTERS.ACHIEVEMENTS) && (
        <div className={utilityStyles.mt32}>
          <Collapsible title="Achievements">
            <SuggestionBox
              placeholder="Search for an achievement"
              purpose="achievements"
              onSelect={addAchievementToFilter}
            />
            {search.selectedAchievements.length > 0 && (
              <div className={utilityStyles.mt16}>
                {search.selectedAchievements.map((achievement) => {
                  return (
                    <Pill
                      key={achievement.id}
                      name={achievement.name}
                      removable={true}
                      onRemove={() => removeAchievementFromFilter(achievement)}
                    />
                  );
                })}
              </div>
            )}
          </Collapsible>
        </div>
      )}
      {companyAttrFiltersComponent}

      <div className={utilityStyles.mt32}>
        <WideButton text="Manage filters" action={handleAddFilter} />
      </div>
      {modal.isModalOpen && (
        <EditFiltersPopup
          onCancel={handlePopupCancel}
          onDone={handlePopupDone}
        />
      )}
    </div>
  );
}

SearchTabFilters.propTypes = {
  achievements: PT.array,
};

function Summary({ filtersApplied, handleReset }) {
  return (
    <div className={styles.searchTabFiltersSummary}>
      <div className={styles.searchTabFiltersSummaryTextContainer}>
        <div className={styles.searchTabFiltersSummaryTextContainerRow}>
          <div className={styles.searchTabFiltersSummaryTextIcon}></div>
          <div className={styles.searchTabFiltersSummaryText}>
            {filtersApplied} {filtersApplied === 1 ? "filter" : "filters"}{" "}
            applied
          </div>
        </div>
      </div>
      <div className={styles.searchTabFiltersSummaryResetBtn}>
        <Button onClick={handleReset}>Reset</Button>
      </div>
    </div>
  );
}
