import {
  Navbar as NextUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
} from "@nextui-org/navbar";
import { Key, createRef, use, useEffect, useRef, useState } from "react";
import { MyAvatar } from "./avatar";
import { title } from "./primitives";
import { Button, ButtonGroup } from "@nextui-org/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookBookmark, faBookOpen, faBug, faBugSlash, faCircleInfo, faCircleQuestion, faGear, faGraduationCap, faLink, faMagnifyingGlassLocation, faMinus, faPause, faPlay, faPlus, faRepeat, faRoute, faStreetView, faTextSlash, faTrowelBricks } from "@fortawesome/free-solid-svg-icons";
import { inputDefaults } from "@/src/configs/defaults";
import { DELAYSTEP, updateDelay } from "@/src/Events/Delay.EventListeners";
import { reset } from "@/src";
import { globals } from "@/src/configs/globals";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Tooltip, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Select, SelectItem, Selection, Popover, PopoverTrigger, PopoverContent } from "@nextui-org/react";
import { mazeGenerationAlgorithms, mazeSolvingAlgorithms } from "@/src/configs/controlCenter.config";
import { AlgorithmDescription } from "./algorithmDescription";
import { FirstSection } from "./firstSection";
import { color } from "@/types";


export const Navbar = () => {

  const controleCenterButton = createRef<HTMLButtonElement>();
  const resetButton = createRef<HTMLButtonElement>();
  const pauseButton = createRef<HTMLButtonElement>();
  const debugButton = createRef<HTMLButtonElement>();
  const debugBooklet = createRef<HTMLButtonElement>();
  const increment = createRef<HTMLButtonElement>();
  const decrement = createRef<HTMLButtonElement>();
  const numberInput = createRef<HTMLInputElement>();

  const depthFilterButton = createRef<HTMLButtonElement>();


  const [inputValue, setInputValue] = useState(inputDefaults.DELAY as unknown as string);
  const inputValueRef = useRef(inputValue);

  useEffect(() => {
    inputValueRef.current = inputValue;
  }, [inputValue]);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("e.target.value => ", e.target.value);
    const newValue = e.target.value;
    if (!/^\d*$/.test(newValue) || newValue === "") {
      updateDelay(inputDefaults.DELAY, setInputValue);
    } else {
      updateDelay(parseInt(newValue), setInputValue);
    }
  }

  const incrementDelay = () => {
    const value: number = parseInt(inputValueRef.current) + DELAYSTEP > inputDefaults.MAXDELAY ? inputDefaults.MAXDELAY : parseInt(inputValueRef.current) + DELAYSTEP;

    updateDelay(value, setInputValue);
  }

  const decrementDelay = () => {
    const value: number = parseInt(inputValueRef.current) - DELAYSTEP < inputDefaults.MINDELAY ? inputDefaults.MINDELAY : parseInt(inputValueRef.current) - DELAYSTEP;

    updateDelay(value, setInputValue);
  }

  const [pauseButtonIcon, setPauseButtonIcon] = useState(inputDefaults.ISPAUSED ? faPlay : faPause);

  const handlePauseButton = () => {
    globals.isPaused = !globals.isPaused;
    setPauseButtonIcon(globals.isPaused ? faPlay : faPause);
  };

  const [debugButtonIcon, setDebugButtonIcon] = useState(inputDefaults.DEBUGMODEON ? faBug : faBugSlash);
  const [debugButtonColor, setDebugButtonColor] = useState((inputDefaults.DEBUGMODEON ? "primary" : "default") as "primary" | "default" | "secondary" | "success" | "warning" | "danger" | undefined);

  const handleDebugButton = () => {
    globals.debugModeOn = !globals.debugModeOn;
    setDebugButtonIcon(globals.debugModeOn ? faBug : faBugSlash);
    setDebugButtonColor(globals.debugModeOn ? "primary" : "default");
    if (globals.debugModeOn !== globals.debugBookletIsOn) {
      handleDebugBooklet();
      console.log("debugBooklet is toggled");
    }
  };

  const [debugBookletColor, setDebugBookletColor] = useState(inputDefaults.DEBUGBOOKLETISON ? "primary" as typeof color : "default" as typeof color);

  const handleDebugBooklet = () => {
    globals.debugBookletIsOn = !globals.debugBookletIsOn;
    setDebugBookletColor(globals.debugBookletIsOn ? "primary" : "default");
  };

  const handleResetButton = () => {
    reset();
  };

  const addDepthFilter = () => {
    console.log("addDepthFilter");
  };

  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const isControlCenterOpen = useRef(isOpen);
  useEffect(() => {
    isControlCenterOpen.current = isOpen;
  }, [isOpen]);

  const [mazeSolvingAlgorithmValue, setmazeSolvingAlgorithmValue] = useState<Selection>(new Set([]));
  const [mazeBuildingAlgorithmValue, setmazeBuildingAlgorithmValue] = useState<Selection>(new Set([]));

  // useEffect(() => {
  //   console.log("mazeBuildingAlgorithmValue => ", Array.from(mazeBuildingAlgorithmValue)[0]);
  //   console.log("mazeSolvingAlgorithmValue => ", Array.from(mazeSolvingAlgorithmValue)[0]);
  // }, [mazeSolvingAlgorithmValue, mazeBuildingAlgorithmValue]);


  const handleLaunchButton = () => {
    globals.mazeBuildingAlgorithm = Array.from(mazeBuildingAlgorithmValue)[0] as string;
    globals.mazeSolvingAlgorithm = Array.from(mazeSolvingAlgorithmValue)[0] as string;
    onClose();
  };

  useEffect(() => {

    const windowShortcutes = (event: any) => {

      console.log("event => ", event);
      if (event.code === 'KeyC') {
        if (!isControlCenterOpen.current)
          onOpen();
        if (isControlCenterOpen.current)
          onClose();
      }
      if (event.code === 'KeyR' && !event.ctrlKey) {
        handleResetButton();
      }
      if (event.code === 'KeyP') {
        console.log("pauseButton.current => ");
        handlePauseButton();
      }
      if (event.code === 'KeyD') {
        handleDebugButton();
      }
      if (event.code === 'KeyB' && globals.debugModeOn) {
        handleDebugBooklet();
      }
      if (event.key === '-') {
        decrementDelay();
      }
      if (event.code === '+' || event.key === '=') {
        incrementDelay();
      }
    }

    window.addEventListener('keydown', windowShortcutes);

    return () => {
      window.removeEventListener('keydown', windowShortcutes);
    }

  }, []);



  const [tooltipDelay, setTooltipDelay] = useState(inputDefaults.DEFAULTTOOLTIPSTATE);
  const tooltipDelayRef = useRef(tooltipDelay);

  useEffect(() => {
    tooltipDelayRef.current = tooltipDelay;
  }, [tooltipDelay]);

  const handleProjectMenu = (e: Key) => {
    console.log("e => ", e);
    if (e === "Tuto") {
      console.log("Tuto");
    }
    if (e === "copy") {
      console.log("copy");
    }
    if (e === "Tooltips") {
      setTooltipDelay(tooltipDelayRef.current === inputDefaults.TOOLTIPDELAY ? inputDefaults.DISABLETOOLTIP : inputDefaults.TOOLTIPDELAY);
    }
  };


  return (
    <NextUINavbar maxWidth="full" position="sticky" isBordered id="nav">
      <NavbarContent id="firstSection" as="div" justify="start">
        <FirstSection tooltipDelayRef={tooltipDelayRef} />
      </NavbarContent>

      <NavbarContent id="secondSection" as="div" justify="center">
        <Tooltip content="project menu" showArrow={true} color="primary" delay={tooltipDelay} closeDelay={200} placement="bottom">
          <div>

            <Dropdown>
              <DropdownTrigger>
                <Button color="primary" variant="light" size="lg">
                  <h1 className={title({ color: "blue", size: "md", fullWidth: true })}>
                    Daedalus
                  </h1>
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Static Actions"
                color="primary"
                variant="light"
                onAction={handleProjectMenu}
              >
                <DropdownItem
                  key="Tuto"
                  description="Take a Tour"
                  endContent={<FontAwesomeIcon icon={faGraduationCap} size="lg" />}
                >
                  Tutorial</DropdownItem>
                <DropdownItem
                  key="copy"
                  description="Share it with ur friends"
                  endContent={<FontAwesomeIcon icon={faLink} size="lg" />}
                >
                  Copy link
                </DropdownItem>
                <DropdownItem
                  key="Tooltips"
                  description="Those descriptive popups"
                  endContent={<FontAwesomeIcon icon={faTextSlash} size="lg" />}
                >
                  Toggel Tooltips</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </Tooltip>
      </NavbarContent>

      <NavbarContent id="thirdSection" as="div" justify="end">
        <Tooltip content="Control Center" showArrow={true} color="primary" delay={tooltipDelay} closeDelay={200} placement="bottom-end">
          <Button ref={controleCenterButton} color="primary" isIconOnly size="sm" onClick={onOpen}>
            <FontAwesomeIcon icon={faGear} rotation={90} size="lg" />
          </Button>
        </Tooltip>

        <Modal isOpen={isOpen} onOpenChange={onOpenChange} className="items-center" size="xl" backdrop="blur">
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">Control Center</ModalHeader>
                <ModalBody className="flex flex-grow w-full">
                  <p>
                    here u can chose the algorithm u want to use to build the
                    maze/mazes (if u choose to apply areas) and the
                    algorithm/algorithms (if u choose to apply areas) u want to
                    use to solve the maze.
                  </p>
                  <div id="algorithm selection" className="flex flex-row gap-3 w-full">
                    {//TODO - add sections for maze building and maze solving algorithms for each behavior group 
                    }
                    <Select
                      label="Maze Building Algorithm"
                      size="md"
                      radius="sm"
                      placeholder="Select an Algorithm"
                      // startContent={<FontAwesomeIcon icon={faTrowelBricks} size="sm" />}
                      selectorIcon={<FontAwesomeIcon icon={faTrowelBricks} size="sm" />}
                      disableSelectorIconRotation
                      // defaultSelectedKeys={["Random"]}
                      description="The algorithm used to build the maze"
                      selectedKeys={mazeBuildingAlgorithmValue}
                      onSelectionChange={setmazeBuildingAlgorithmValue}
                    >
                      {mazeGenerationAlgorithms.map((algo) => (
                        <SelectItem key={algo.key} value={algo.name} >
                          {algo.name}
                        </SelectItem>
                      ))}
                    </Select>
                    <Select
                      label="Maze solving Algorithm"
                      size="md"
                      radius="sm"
                      placeholder="Select an Algorithm"
                      // startContent={<FontAwesomeIcon icon={faMagnifyingGlassLocation} size="sm" />}
                      selectorIcon={<FontAwesomeIcon icon={faRoute} size="sm" />}
                      disableSelectorIconRotation
                      // defaultSelectedKeys={["Random"]}
                      description="The algorithm used to solve the maze"
                      selectedKeys={mazeSolvingAlgorithmValue}
                      onSelectionChange={setmazeSolvingAlgorithmValue}
                    >
                      {mazeSolvingAlgorithms.map((algo) => (
                        <SelectItem key={algo.key} value={algo.name}>
                          {algo.name}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="light" onPress={onClose}>
                    Close
                  </Button>
                  <Button
                    isDisabled={!Array.from(mazeBuildingAlgorithmValue)[0] || !Array.from(mazeSolvingAlgorithmValue)[0]}
                    color="primary"
                    onPress={handleLaunchButton}
                  >
                    Launch
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
        <Tooltip content="Reset" showArrow={true} color="primary" delay={tooltipDelay} closeDelay={200}>
          <Button ref={resetButton} color="primary" isIconOnly size="sm" onClick={handleResetButton}>
            <FontAwesomeIcon icon={faRepeat} size="lg" />
          </Button>
        </Tooltip>
        <Tooltip content="Play-Pause" showArrow={true} color="primary" delay={tooltipDelay} closeDelay={200}>
          <Button ref={pauseButton} color="primary" isIconOnly size="sm" onClick={handlePauseButton}>
            <FontAwesomeIcon icon={pauseButtonIcon} size="lg" />
          </Button>
        </Tooltip>
        <ButtonGroup >
          <Tooltip content="Debug Booklet Toggel" showArrow={true} color="primary" delay={tooltipDelay} closeDelay={200}>
            <Button ref={debugBooklet} color={debugBookletColor} isIconOnly size="sm" onClick={handleDebugBooklet}>
              <FontAwesomeIcon icon={faBookOpen} size="lg" />
            </Button>
          </Tooltip>

          <Tooltip content="Debuger Toggel" showArrow={true} color="primary" delay={tooltipDelay} closeDelay={200}>
            <Button ref={debugButton} color={debugButtonColor} isIconOnly size="sm" onClick={handleDebugButton}>
              <FontAwesomeIcon icon={debugButtonIcon} size="lg" />
            </Button>
          </Tooltip>

        </ButtonGroup>

        <Tooltip content="Depth Filter" showArrow={true} color="primary" delay={tooltipDelay} closeDelay={200}>
          <Button ref={depthFilterButton} color="primary" isIconOnly size="sm" onClick={addDepthFilter}>
            {
              //TODO - handle the depth filter stuff
            }
            <FontAwesomeIcon icon={faStreetView} size="lg" />
          </Button>
        </Tooltip>

        <ButtonGroup>
          <Tooltip content="Decrement Delay" showArrow={true} color="primary" delay={tooltipDelay} closeDelay={200}>
            <Button ref={decrement} color="primary" isIconOnly size="sm" onClick={decrementDelay}>
              <FontAwesomeIcon icon={faMinus} size="lg" />
            </Button>
          </Tooltip>
          <Tooltip content="Delay in milliseconds" showArrow={true} color="primary" delay={tooltipDelay} closeDelay={200}>
            <input
              type="text"
              ref={numberInput}
              className=" h-8 text-center"
              size={1}
              value={inputValue}
              onBlur={onInputChange}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setInputValue(e.target.value)
              }}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === "Enter") {
                  numberInput.current?.blur();
                }
              }}
            />
          </Tooltip>
          <Tooltip content="Increment Delay" showArrow={true} color="primary" delay={tooltipDelay} closeDelay={200}>
            <Button ref={increment} color="primary" isIconOnly size="sm" onClick={incrementDelay}>
              <FontAwesomeIcon icon={faPlus} size="lg" />
            </Button>
          </Tooltip>
        </ButtonGroup>

      </NavbarContent>
    </NextUINavbar >
  );
};

// const searchInput = (
// 	<Input
// 		aria-label="Search"
// 		classNames={{
// 			inputWrapper: "bg-default-100",
// 			input: "text-sm",
// 		}}
// 		endContent={
// 			<Kbd className="hidden lg:inline-block" keys={["command"]}>
// 				K
// 			</Kbd>
// 		}
// 		labelPlacement="outside"
// 		placeholder="Search..."
// 		startContent={
// 			<SearchIcon className="text-base text-default-400 pointer-events-none flex-shrink-0" />
// 		}
// 		type="search"
// 	/>
// );
{/* <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
				<NavbarBrand as="li" className="gap-3 max-w-fit">
					<NextLink className="flex justify-start items-center gap-1" href="/">
						<Logo />
						<p className="font-bold text-inherit">ACME</p>
					</NextLink>
				</NavbarBrand>
				<ul className="hidden lg:flex gap-4 justify-start ml-2">
					{siteConfig.navItems.map((item) => (
						<NavbarItem key={item.href}>
							<NextLink
								className={clsx(
									linkStyles({ color: "foreground" }),
									"data-[active=true]:text-primary data-[active=true]:font-medium"
								)}
								color="foreground"
								href={item.href}
							>
								{item.label}
							</NextLink>
						</NavbarItem>
					))}
				</ul>
			</NavbarContent>

			<NavbarContent
				className="hidden sm:flex basis-1/5 sm:basis-full"
				justify="end"
			>
				<NavbarItem className="hidden sm:flex gap-2">
					<Link isExternal href={siteConfig.links.twitter} aria-label="Twitter">
						<TwitterIcon className="text-default-500" />
					</Link>
					<Link isExternal href={siteConfig.links.discord} aria-label="Discord">
						<DiscordIcon className="text-default-500" />
					</Link>
					<Link isExternal href={siteConfig.links.github} aria-label="Github">
						<GithubIcon className="text-default-500" />
					</Link>
				</NavbarItem>
				<NavbarItem className="hidden lg:flex">{searchInput}</NavbarItem>
				<NavbarItem className="hidden md:flex">
					<Button
            isExternal
						as={Link}
						className="text-sm font-normal text-default-600 bg-default-100"
						href={siteConfig.links.sponsor}
						startContent={<HeartFilledIcon className="text-danger" />}
						variant="flat"
					>
						Sponsor
					</Button>
				</NavbarItem>
			</NavbarContent>

			<NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
				<Link isExternal href={siteConfig.links.github} aria-label="Github">
					<GithubIcon className="text-default-500" />
				</Link>
				<NavbarMenuToggle />
			</NavbarContent>

			<NavbarMenu>
				{searchInput}
				<div className="mx-4 mt-2 flex flex-col gap-2">
					{siteConfig.navMenuItems.map((item, index) => (
						<NavbarMenuItem key={`${item}-${index}`}>
							<Link
								color={
									index === 2
										? "primary"
										: index === siteConfig.navMenuItems.length - 1
										? "danger"
										: "foreground"
								}
								href="#"
								size="lg"
							>
								{item.label}
							</Link>
						</NavbarMenuItem>
					))}
				</div>
			</NavbarMenu> */}