"use client";

import {
  Button,
  Heading,
  Input,
  Stack,
  Text,
  VStack,
  HStack,
  Slider,
} from "@chakra-ui/react";
import { FilterSection } from "./FilterSection";
import { FilterToggleList } from "./FilterToggleList";
import { ratingOptions } from "../constants";
import { clampValue } from "../utils";

type FilterSidebarProps = {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onApply: () => void;
  onReset: () => void;

  priceRange: [number, number];
  minPriceFilter: number | null;
  maxPriceFilter: number | null;
  sliderValue: [number, number];
  sliderStep: number;
  showSlider: boolean;
  onPriceInputChange: (index: 0 | 1, value: string) => void;
  onSliderChange: (value: number[]) => void;

  destinationOptions: string[];
  selectedDestinations: string[];
  onToggleDestination: (value: string) => void;

  tagOptions: string[];
  selectedTags: string[];
  onToggleTag: (value: string) => void;

  selectedRating: number | null;
  onSelectRating: (value: number | null) => void;
};

export function FilterSidebar(props: FilterSidebarProps) {
  const {
    searchQuery,
    onSearchChange,
    onApply,
    onReset,
    priceRange,
    minPriceFilter,
    maxPriceFilter,
    sliderValue,
    sliderStep,
    showSlider,
    onPriceInputChange,
    onSliderChange,
    destinationOptions,
    selectedDestinations,
    onToggleDestination,
    tagOptions,
    selectedTags,
    onToggleTag,
    selectedRating,
    onSelectRating,
  } = props;

  const canFilterByPrice = showSlider;
  const priceSummaryText = canFilterByPrice
    ? `${priceRange[0].toLocaleString()} - ${priceRange[1].toLocaleString()}`
    : "No price data available";

  return (
    <VStack gap={2} w="full">
      <FilterSection title="Quick Search">
        <Stack gap={3}>
          <Input
            placeholder="Tour name or destination"
            borderRadius="lg"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
          />
          <HStack gap={2}>
            <Button colorScheme="teal" borderRadius="full" flex={1} onClick={onApply}>
              Filter
            </Button>
            <Button variant="ghost" colorScheme="teal" borderRadius="full" onClick={onReset}>
              Reset
            </Button>
          </HStack>
        </Stack>
      </FilterSection>

      <FilterSection title="Price Range">
        <Stack gap={4}>
          <Text fontWeight="semibold" color="gray.700">
            {priceSummaryText}
          </Text>
          {showSlider ? (
            <Slider.Root
              min={priceRange[0]}
              max={priceRange[1]}
              step={sliderStep}
              value={sliderValue}
              onValueChange={(details) => onSliderChange(details.value)}
              width="100%"
            >
              <Slider.Control>
                <Slider.Track bg="gray.100" h="6px" borderRadius="full" flex="1">
                  <Slider.Range bg="teal.400" borderRadius="full" />
                </Slider.Track>
                <Slider.Thumb
                  index={0}
                  boxSize="16px"
                  bg="white"
                  border="2px solid"
                  borderColor="teal.400"
                  borderRadius="full"
                  boxShadow="md"
                  aria-label="Minimum price"
                >
                  <Slider.HiddenInput />
                </Slider.Thumb>
                <Slider.Thumb
                  index={1}
                  boxSize="16px"
                  bg="white"
                  border="2px solid"
                  borderColor="teal.400"
                  borderRadius="full"
                  boxShadow="md"
                  aria-label="Maximum price"
                >
                  <Slider.HiddenInput />
                </Slider.Thumb>
              </Slider.Control>
            </Slider.Root>
          ) : (
            <Text fontSize="sm" color="gray.500">
              Price slider is unavailable for the current results.
            </Text>
          )}
          <HStack gap={3}>
            <Input
              type="number"
              borderRadius="lg"
              value={minPriceFilter ?? ""}
              placeholder={canFilterByPrice ? `${priceRange[0]}` : "0"}
              onChange={(event) => onPriceInputChange(0, event.target.value)}
              disabled={!canFilterByPrice}
            />
            <Text color="gray.500">to</Text>
            <Input
              type="number"
              borderRadius="lg"
              value={maxPriceFilter ?? ""}
              placeholder={canFilterByPrice ? `${priceRange[1]}` : "0"}
              onChange={(event) => onPriceInputChange(1, event.target.value)}
              disabled={!canFilterByPrice}
            />
          </HStack>
        </Stack>
      </FilterSection>

      <FilterSection title="Rating">
        <Stack gap={2}>
          {ratingOptions.map((option) => {
            const active = selectedRating === option.value;
            return (
              <Button
                key={option.value}
                variant={active ? "solid" : "outline"}
                colorScheme="teal"
                borderRadius="lg"
                justifyContent="flex-start"
                onClick={() => onSelectRating(active ? null : option.value)}
              >
                {option.label}
              </Button>
            );
          })}
        </Stack>
      </FilterSection>

      {destinationOptions.length > 0 && (
        <FilterSection title="Destinations">
          <FilterToggleList
            options={destinationOptions}
            selected={selectedDestinations}
            toggleOption={onToggleDestination}
          />
        </FilterSection>
      )}

      {tagOptions.length > 0 && (
        <FilterSection title="Highlights">
          <FilterToggleList options={tagOptions} selected={selectedTags} toggleOption={onToggleTag} />
        </FilterSection>
      )}
    </VStack>
  );
}


